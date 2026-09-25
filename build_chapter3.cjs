const fs = require('fs');
const path = require('path');
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType, 
  VerticalAlign,
  ShadingType,
  ImageRun,
  PageOrientation,
  LineRuleType
} = require('docx');

// A4 Dimensions in DXA (1/20 of a pt)
const PORTRAIT_TABLE_WIDTH_DXA = 11906 - (1440 * 2); // 9026 dxa
const LANDSCAPE_TABLE_WIDTH_DXA = 16838 - (1440 * 2); // 13958 dxa

const font = "TH Sarabun New";
const fontSize = 32; // 16pt (docx uses half-points: 16 * 2 = 32)
const fontSizeTitle = 36; // 18pt
const fontSizeHeader = 28; // 14pt

function getPngDimensions(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') {
      return null;
    }
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height };
  } catch (e) {
    return null;
  }
}

function createPara(text, options = {}) {
  const runs = [];
  const lines = (text || "").split('\n');
  lines.forEach((line, idx) => {
    runs.push(
      new TextRun({
        text: line,
        font: font,
        size: options.size || fontSize,
        bold: options.bold || false,
        break: idx > 0 ? 1 : 0
      })
    );
  });

  const pOptions = {
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: options.spaceBefore !== undefined ? options.spaceBefore : 0, after: options.spaceAfter !== undefined ? options.spaceAfter : 0, line: 240, lineRule: LineRuleType.AUTO },
    keepWithNext: options.keepWithNext || false,
    pageBreakBefore: options.pageBreakBefore || false,
    children: runs
  };

  if (options.indent) {
    pOptions.indent = options.indent;
  }

  return new Paragraph(pOptions);
}

function createHeading1(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 140, line: 360, lineRule: LineRuleType.AUTO },
    keepWithNext: true,
    children: [
      new TextRun({
        text: text,
        font: font,
        size: fontSizeTitle,
        bold: true
      })
    ]
  });
}

function createHeading2(text, options = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 180, after: 100, line: 360, lineRule: LineRuleType.AUTO },
    keepWithNext: true,
    pageBreakBefore: options.pageBreakBefore || false,
    children: [
      new TextRun({
        text: text,
        font: font,
        size: fontSize,
        bold: true
      })
    ]
  });
}

function createHeading3(text, options = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: { left: 400 },
    spacing: { before: 140, after: 80, line: 360, lineRule: LineRuleType.AUTO },
    keepWithNext: true,
    pageBreakBefore: options.pageBreakBefore || false,
    children: [
      new TextRun({
        text: text,
        font: font,
        size: fontSize,
        bold: true
      })
    ]
  });
}

function createImageBlock(imagePath, captionText, maxW = 460, maxH = 370, pageBreakBefore = false) {
  if (!fs.existsSync(imagePath)) {
    console.warn("Image file not found:", imagePath);
    return [createPara(captionText, { alignment: AlignmentType.CENTER, bold: true })];
  }
  const imgData = fs.readFileSync(imagePath);
  const dim = getPngDimensions(imagePath) || { width: 800, height: 600 };
  const ratio = dim.width / dim.height;
  
  let w = maxW;
  let h = Math.round(w / ratio);
  
  if (h > maxH) {
    h = maxH;
    w = Math.round(h * ratio);
  }

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 30 },
      keepWithNext: true,
      pageBreakBefore: pageBreakBefore,
      children: [
        new ImageRun({
          data: imgData,
          transformation: {
            width: w,
            height: h
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 30, after: 100 },
      children: [
        new TextRun({
          text: captionText,
          font: font,
          size: fontSize,
          bold: true
        })
      ]
    })
  ];
}

function createScreenshotImageBlock(imagePath, captionText, maxW = 500, maxH = 310) {
  if (!fs.existsSync(imagePath)) {
    console.warn("Screenshot file not found:", imagePath);
    return [createPara(captionText, { alignment: AlignmentType.CENTER, bold: true })];
  }
  const imgData = fs.readFileSync(imagePath);
  const dim = getPngDimensions(imagePath) || { width: 1920, height: 1080 };
  const ratio = dim.width / dim.height;
  
  let w = maxW;
  let h = Math.round(w / ratio);
  
  if (h > maxH) {
    h = maxH;
    w = Math.round(h * ratio);
  }

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
      contextualSpacing: true,
      indent: { left: 0, right: 0 },
      keepWithNext: true,
      children: [
        new ImageRun({
          data: imgData,
          transformation: {
            width: w,
            height: h
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
      contextualSpacing: true,
      indent: { left: 0, right: 0 },
      children: [
        new TextRun({
          text: captionText,
          font: font,
          size: fontSize,
          bold: true
        })
      ]
    })
  ];
}

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "000000" }
};

// Data Dictionary Table for LANDSCAPE layout (Total width = 13958 dxa)
function createDictTableLandscape(tableTitle, tableName, rowsData) {
  const tableRows = [];
  
  const colWidths = [2400, 3800, 2000, 1300, 1900, 2558];
  const headers = ["Attribute Name", "Description", "Data Type", "Key Type", "Reference Table", "Sample Data"];
  
  const headerCells = headers.map((h, i) => new TableCell({
    width: { size: colWidths[i], type: WidthType.DXA },
    shading: { fill: "F2F2F2" },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 30, after: 30, line: 280, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: h,
            font: font,
            size: fontSizeHeader,
            bold: true,
            color: "000000"
          })
        ]
      })
    ]
  }));
  
  tableRows.push(new TableRow({ 
    cantSplit: true,
    tableHeader: true,
    children: headerCells 
  }));
  
  rowsData.forEach(row => {
    const cells = row.map((cellText, i) => {
      const lines = (cellText || "").split('\n');
      const paras = lines.map(line => new Paragraph({
        alignment: (i === 3 || i === 0) ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 30, after: 30, line: 280, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: line, font: font, size: fontSizeHeader })]
      }));
      return new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: paras
      });
    });
    tableRows.push(new TableRow({ 
      cantSplit: true,
      children: cells 
    }));
  });

  return [
    createPara(tableTitle, { bold: true, spaceBefore: 180, spaceAfter: 60, keepWithNext: true }),
    new Table({
      width: { size: LANDSCAPE_TABLE_WIDTH_DXA, type: WidthType.DXA },
      borders: tableBorders,
      rows: tableRows
    }),
    new Paragraph({ spacing: { after: 140 } })
  ];
}

// Landscape Test Case Table (Total Width = 13958 DXA)
function createTestCaseTableLandscape(testTableTitle, preCond, testCases) {
  const tableRows = [];
  
  const colWidths = [1900, 2200, 3000, 2000, 3058, 900, 900];
  const headers = ["Pre-condition", "กรณีทดสอบ(Test Case)", "ขั้นตอนการทดสอบ(Test Step)", "Test Data", "Expect Results", "สถานะ", "หมายเหตุ"];
  
  const headerCells = headers.map((h, i) => new TableCell({
    width: { size: colWidths[i], type: WidthType.DXA },
    shading: { fill: "F2F2F2" },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 30, after: 30, line: 280, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: h, font: font, size: fontSizeHeader, bold: true })]
      })
    ]
  }));
  tableRows.push(new TableRow({ 
    cantSplit: true,
    tableHeader: true,
    children: headerCells 
  }));

  testCases.forEach((tc, idx) => {
    const makeParas = (str, isBold = false, isCenter = false) => {
      const lines = (str || "").split('\n');
      return lines.map(line => new Paragraph({
        alignment: isCenter ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 20, after: 20, line: 280, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: line, font: font, size: fontSizeHeader, bold: isBold })]
      }));
    };

    const cells = [
      new TableCell({
        width: { size: colWidths[0], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: idx === 0 ? makeParas(preCond) : [new Paragraph({ spacing: { before: 20, after: 20 }, children: [] })]
      }),
      new TableCell({
        width: { size: colWidths[1], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: makeParas(tc.title, true)
      }),
      new TableCell({
        width: { size: colWidths[2], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: makeParas(tc.step)
      }),
      new TableCell({
        width: { size: colWidths[3], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: makeParas(tc.data)
      }),
      new TableCell({
        width: { size: colWidths[4], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: makeParas(tc.expect)
      }),
      new TableCell({
        width: { size: colWidths[5], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: makeParas(tc.status || "ผ่าน", false, true)
      }),
      new TableCell({
        width: { size: colWidths[6], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: makeParas(tc.note || "-", false, true)
      })
    ];
    tableRows.push(new TableRow({ 
      cantSplit: true,
      children: cells 
    }));
  });

  return [
    createPara(testTableTitle, { bold: true, spaceBefore: 180, spaceAfter: 60, keepWithNext: true }),
    new Table({
      width: { size: LANDSCAPE_TABLE_WIDTH_DXA, type: WidthType.DXA },
      borders: tableBorders,
      rows: tableRows
    }),
    new Paragraph({ spacing: { after: 140 } })
  ];
}

async function buildDoc() {
  const imgBase = 'd:/ConnecXus/wordadmin/Word/images';

  // ==========================================
  // SECTION 1: Portrait (3.1 - 3.3.2 DFDs & ERD)
  // ==========================================
  const sec1Elements = [];

  sec1Elements.push(createHeading1("บทที่ 3"));
  sec1Elements.push(createHeading1("วิธีการดำเนินงาน"));
  sec1Elements.push(createPara("โครงงานระบบเครือข่ายสังคมออนไลน์ ConnecXus ประกอบด้วยวิธีการดำเนินงานที่เกี่ยวข้องดังต่อไปนี้", { spaceBefore: 140, spaceAfter: 100 }));

  const outlines = [
    "3.1 ประชากรและกลุ่มตัวอย่าง",
    "3.2 เครื่องมือที่ใช้ในการดำเนินงานโครงงาน",
    "3.3 การวิเคราะห์ระบบ",
    "    3.3.1 แผนภาพกระแสข้อมูล (Data Flow Diagram: DFD)",
    "    3.3.2 ความสัมพันธ์ของฐานข้อมูล (Entity Relationship Diagram)",
    "    3.3.3 พจนานุกรมข้อมูล (Data Dictionary)",
    "    3.3.4 ผังโครงสร้างเว็บไซต์ (Site Map)",
    "3.4 ออกแบบหน้าจอโปรแกรม",
    "3.5 การทดสอบระบบ",
    "3.6 ศึกษาวิเคราะห์และการเก็บรวบรวมข้อมูล",
    "3.7 ศึกษาวิเคราะห์ข้อมูลและสถิติที่ใช้"
  ];
  outlines.forEach(o => sec1Elements.push(createPara(o, { spaceBefore: 30, spaceAfter: 30 })));

  sec1Elements.push(createHeading2("3.1 ประชากรและกลุ่มตัวอย่าง"));
  sec1Elements.push(createPara("ในการประเมินประสิทธิภาพและความพึงพอใจของระบบ คณะผู้จัดทำได้กำหนดกลุ่มเป้าหมายดังนี้:"));
  sec1Elements.push(createPara("3.1.1 ประชากร (Population) คือ กลุ่มผู้ใช้งานทั่วไป นักเรียน นักศึกษา และผู้ดูแลระบบที่มีส่วนเกี่ยวข้องกับการสื่อสารและแลกเปลี่ยนข้อมูลบนเครือข่ายสังคมออนไลน์", { indent: { left: 400 } }));
  sec1Elements.push(createPara("3.1.2 กลุ่มตัวอย่าง (Sample) คือ กลุ่มผู้ใช้งานที่แบ่งเป็น 2 กลุ่มตามการใช้งานระบบ โดยเลือกแบบเจาะจง ดังนี้", { indent: { left: 400 } }));
  sec1Elements.push(createPara("1. ผู้ดูแลระบบและผู้เชี่ยวชาญด้านระบบสารสนเทศ จำนวน 5 คน", { indent: { left: 800 } }));
  sec1Elements.push(createPara("2. กลุ่มผู้ใช้งานทั่วไปและสมาชิก จำนวน 25 คน", { indent: { left: 800 } }));

  sec1Elements.push(createHeading2("3.2 เครื่องมือที่ใช้ในการดำเนินงานโครงงาน"));
  sec1Elements.push(createHeading3("3.2.1 เครื่องมือด้านฮาร์ดแวร์ (Hardware)"));
  sec1Elements.push(createPara("1. คอมพิวเตอร์สำหรับการพัฒนาระบบ จำนวน 1 เครื่อง", { indent: { left: 600 } }));
  sec1Elements.push(createPara("- Intel Core i5-1145G7 @ 2.60 GHz หรือเทียบเท่า", { indent: { left: 1000 } }));
  sec1Elements.push(createPara("- RAM DDR4 16 GB", { indent: { left: 1000 } }));
  sec1Elements.push(createPara("- SSD 512 GB NVMe", { indent: { left: 1000 } }));
  sec1Elements.push(createPara("2. สมาร์ตโฟนสำหรับทดสอบการแสดงผลแบบ Responsive รองรับทั้งระบบปฏิบัติการ iOS และ Android", { indent: { left: 600 } }));

  sec1Elements.push(createHeading3("3.2.2 เครื่องมือด้านซอฟต์แวร์และเทคโนโลยี (Software & Technology)"));
  sec1Elements.push(createPara("3.2.2.1 Front-end Development", { indent: { left: 600 }, bold: true }));
  sec1Elements.push(createPara("- ใช้ภาษา HTML, CSS และ JavaScript / TypeScript ในการกำหนดโครงสร้างและสไตล์ของหน้าเว็บ", { indent: { left: 800 } }));
  sec1Elements.push(createPara("- ใช้ Nuxt 4 (Vue.js 3 Composition API) เป็น Framework ในการพัฒนาส่วนติดต่อผู้ใช้ (User Interface)", { indent: { left: 800 } }));
  sec1Elements.push(createPara("- ใช้ TailwindCSS และ Lucide Icons สำหรับการจัดเลย์เอาต์และการออกแบบหน้าจอที่ทันสมัย", { indent: { left: 800 } }));
  sec1Elements.push(createPara("- ใช้ Tiptap Rich Text Editor ในการสร้างและแก้ไขโพสต์บทความ", { indent: { left: 800 } }));

  sec1Elements.push(createPara("3.2.2.2 Back-end Development", { indent: { left: 600 }, bold: true }));
  sec1Elements.push(createPara("- ใช้ภาษา TypeScript ในส่วนของการทำงานฝั่งเซิร์ฟเวอร์ (Server-Side Nitro Engine)", { indent: { left: 800 } }));
  sec1Elements.push(createPara("- ใช้ Node.js เป็น JavaScript Runtime ในการพัฒนาแอปพลิเคชันฝั่งเซิร์ฟเวอร์", { indent: { left: 800 } }));
  sec1Elements.push(createPara("- ใช้ WebSocket (ws) สำหรับการสื่อสารสองทิศทางแบบเรียลไทม์ (Real-time Messaging & Live Notifications)", { indent: { left: 800 } }));
  sec1Elements.push(createPara("- ใช้ JSON Web Token (JWT) และ Bcrypt.js สำหรับการรักษาความปลอดภัยและการยืนยันตัวตน", { indent: { left: 800 } }));

  sec1Elements.push(createPara("3.2.2.3 Database Management", { indent: { left: 600 }, bold: true }));
  sec1Elements.push(createPara("- ใช้ระบบจัดการฐานข้อมูล MySQL ในการสร้าง จัดเก็บ และเรียกอ่านข้อมูลระบบ", { indent: { left: 800 } }));
  sec1Elements.push(createPara("- ใช้ SQL (Structured Query Language) ผ่านไลบรารี mysql2 ในการจัดการฐานข้อมูล เพิ่ม ลบ แก้ไข และดึงข้อมูล", { indent: { left: 800 } }));

  sec1Elements.push(createPara("3.2.2.4 Development & Documentation Tools", { indent: { left: 600 }, bold: true }));
  sec1Elements.push(createPara("1. Windows 11 ใช้เป็นระบบปฏิบัติการหลักในการรันเครื่องและสภาพแวดล้อมที่ใช้เขียนโปรแกรม", { indent: { left: 800 } }));
  sec1Elements.push(createPara("2. Visual Studio Code ใช้เป็นโปรแกรมแก้ไขโค้ด (Code Editor) หลัก", { indent: { left: 800 } }));
  sec1Elements.push(createPara("3. Brave Browser & Google Chrome ใช้เป็นเว็บเบราว์เซอร์ในการรันแสดงผลหน้าจอและทดสอบระบบ", { indent: { left: 800 } }));
  sec1Elements.push(createPara("4. Draw.io ใช้ในการออกแบบแผนภาพ DFD และ ER-Diagram", { indent: { left: 800 } }));
  sec1Elements.push(createPara("5. โปรแกรม Microsoft Word สำหรับจัดทำเอกสารและรายงาน", { indent: { left: 800 } }));

  sec1Elements.push(createHeading2("3.3 การวิเคราะห์ระบบ"));
  sec1Elements.push(createPara("ระบบเครือข่ายสังคมออนไลน์ ConnecXus ผู้จัดทำโครงงานได้วิเคราะห์ระบบเพื่อให้สามารถรองรับการทำงานของผู้ใช้งาน 2 กลุ่ม คือ ผู้ดูแลระบบ และสมาชิก"));
  sec1Elements.push(...createImageBlock(
    path.join(imgBase, 'system_context_overview.png'),
    "ภาพที่ 3.1 แผนภาพบริบทระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    460,
    340
  ));

  // DFD Level 0
  sec1Elements.push(createHeading3("3.3.1 แผนภาพกระแสข้อมูล (Data Flow Diagram: DFD)", { spaceBefore: 140, pageBreakBefore: true }));
  sec1Elements.push(createPara("3.3.1.1 แผนภาพบริบท (Context Diagram)", { bold: true, indent: { left: 400 } }));
  sec1Elements.push(...createImageBlock(
    path.join(imgBase, 'dfd_context_diagram.png'),
    "ภาพที่ 3.2 แผนภาพบริบท (Context Diagram: DFD Level 0) ระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    460,
    370
  ));

  // DFD Level 1 (Admin first, then Member parts — per user request)
  sec1Elements.push(createPara("3.3.1.2 แผนภาพกระแสข้อมูลระดับที่ 1 (Data Flow Diagram Level 1)", { bold: true, indent: { left: 400 }, spaceBefore: 140, pageBreakBefore: true }));
  // Admin processes (part3) come FIRST
  sec1Elements.push(...createImageBlock(
    path.join(imgBase, 'dfd_level1_part3.png'),
    "ภาพที่ 3.3 แผนภาพ DFD Level 1 (ส่วนที่ 1 โปรเซสที่ 15 ถึง 21: ฝั่งผู้ดูแลระบบ - Admin)",
    460,
    370,
    false
  ));
  // Member processes part1 (processes 1-7)
  sec1Elements.push(...createImageBlock(
    path.join(imgBase, 'dfd_level1_part1.png'),
    "ภาพที่ 3.4 แผนภาพ DFD Level 1 (ส่วนที่ 2 โปรเซสที่ 1 ถึง 7: ฝั่งสมาชิก - Member)",
    460,
    370,
    true // Starts cleanly on next page!
  ));
  // Member processes part2 (processes 8-14)
  sec1Elements.push(...createImageBlock(
    path.join(imgBase, 'dfd_level1_part2.png'),
    "ภาพที่ 3.5 แผนภาพ DFD Level 1 (ส่วนที่ 3 โปรเซสที่ 8 ถึง 14: ปฏิสัมพันธ์และชุมชน - Member)",
    460,
    370,
    true // Starts cleanly on next page!
  ));

  // DFD Level 2 (2 diagrams per page with perfect sizing and subheadings like PDF example)
  sec1Elements.push(createPara("3.3.1.3 แผนภาพกระแสข้อมูลระดับที่ 2 (Data Flow Diagram Level 2)", { bold: true, indent: { left: 400 }, spaceBefore: 140, pageBreakBefore: true }));
  
  const dfdLevel2List = [
    // กลุ่มที่ 1: ฝั่งผู้ดูแลระบบ (Admin) - โปรเซสที่ 15 ถึง 21 (ตรงตาม DFD Level 1 ส่วนที่ 1)
    { num: 15, file: 'dfd_level2_p15.png', title: '1) แผนภาพ DFD Level 2 โปรเซสที่ 15 การสร้างและจัดการลิงก์เชิญเข้ากลุ่มชุมชน (Community Invite Link Management)', caption: 'ภาพที่ 3.6 แผนภาพ DFD Level 2 โปรเซสที่ 15 การสร้างและจัดการลิงก์เชิญเข้ากลุ่มชุมชน (Community Invite Link Management)' },
    { num: 16, file: 'dfd_level2_p16.png', title: '2) แผนภาพ DFD Level 2 โปรเซสที่ 16 การสร้างห้องสนทนา (Conversation Setup)', caption: 'ภาพที่ 3.7 แผนภาพ DFD Level 2 โปรเซสที่ 16 การสร้างห้องสนทนา (Conversation Setup)' },
    { num: 17, file: 'dfd_level2_p17.png', title: '3) แผนภาพ DFD Level 2 โปรเซสที่ 17 รับส่งข้อความแชทสด (Real-time Messaging & WebSocket)', caption: 'ภาพที่ 3.8 แผนภาพ DFD Level 2 โปรเซสที่ 17 รับส่งข้อความแชทสด (Real-time Messaging & WebSocket)' },
    { num: 18, file: 'dfd_level2_p18.png', title: '4) แผนภาพ DFD Level 2 โปรเซสที่ 18 ปักหมุดและตั้งค่าแชท (Chat Pinning & Settings)', caption: 'ภาพที่ 3.9 แผนภาพ DFD Level 2 โปรเซสที่ 18 ปักหมุดและตั้งค่าแชท (Chat Pinning & Settings)' },
    { num: 19, file: 'dfd_level2_p19.png', title: '5) แผนภาพ DFD Level 2 โปรเซสที่ 19 การส่งและจัดการรายงานปัญหา (Content Report Management)', caption: 'ภาพที่ 3.10 แผนภาพ DFD Level 2 โปรเซสที่ 19 การส่งและจัดการรายงานปัญหา (Content Report Management)' },
    { num: 20, file: 'dfd_level2_p20.png', title: '6) แผนภาพ DFD Level 2 โปรเซสที่ 20 แอดมินระงับบัญชี (User Moderation & Ban)', caption: 'ภาพที่ 3.11 แผนภาพ DFD Level 2 โปรเซสที่ 20 แอดมินระงับบัญชี (User Moderation & Ban)' },
    { num: 21, file: 'dfd_level2_p21.png', title: '7) แผนภาพ DFD Level 2 โปรเซสที่ 21 การตรวจสอบแดชบอร์ดและ System Logs (Admin Dashboard & Logs)', caption: 'ภาพที่ 3.12 แผนภาพ DFD Level 2 โปรเซสที่ 21 การตรวจสอบแดชบอร์ดและ System Logs (Admin Dashboard & Logs)' },
    
    // กลุ่มที่ 2: ฝั่งสมาชิก (Member ส่วนที่ 1) - โปรเซสที่ 1 ถึง 7 (ตรงตาม DFD Level 1 ส่วนที่ 2)
    { num: 1, file: 'dfd_level2_p1.png', title: '8) แผนภาพ DFD Level 2 โปรเซสที่ 1 การสมัครสมาชิกและการยืนยันตัวตน (User Registration)', caption: 'ภาพที่ 3.13 แผนภาพ DFD Level 2 โปรเซสที่ 1 การสมัครสมาชิกและการยืนยันตัวตน (User Registration)' },
    { num: 2, file: 'dfd_level2_p2.png', title: '9) แผนภาพ DFD Level 2 โปรเซสที่ 2 การเข้าสู่ระบบและการออกโทเคน (User Authentication & JWT)', caption: 'ภาพที่ 3.14 แผนภาพ DFD Level 2 โปรเซสที่ 2 การเข้าสู่ระบบและการออกโทเคน (User Authentication & JWT)' },
    { num: 3, file: 'dfd_level2_p3.png', title: '10) แผนภาพ DFD Level 2 โปรเซสที่ 3 การจัดการข้อมูลส่วนตัวและโปรไฟล์ (Profile Management)', caption: 'ภาพที่ 3.15 แผนภาพ DFD Level 2 โปรเซสที่ 3 การจัดการข้อมูลส่วนตัวและโปรไฟล์ (Profile Management)' },
    { num: 4, file: 'dfd_level2_p4.png', title: '11) แผนภาพ DFD Level 2 โปรเซสที่ 4 การเปลี่ยนรหัสผ่านและการตั้งค่าความปลอดภัย (Security Settings)', caption: 'ภาพที่ 3.16 แผนภาพ DFD Level 2 โปรเซสที่ 4 การเปลี่ยนรหัสผ่านและการตั้งค่าความปลอดภัย (Security Settings)' },
    { num: 5, file: 'dfd_level2_p5.png', title: '12) แผนภาพ DFD Level 2 โปรเซสที่ 5 การติดตามและเลิกติดตามผู้ใช้งาน (Follow Management)', caption: 'ภาพที่ 3.17 แผนภาพ DFD Level 2 โปรเซสที่ 5 การติดตามและเลิกติดตามผู้ใช้งาน (Follow Management)' },
    { num: 6, file: 'dfd_level2_p6.png', title: '13) แผนภาพ DFD Level 2 โปรเซสที่ 6 การบล็อกและปลดบล็อกผู้ใช้งาน (Block Management)', caption: 'ภาพที่ 3.18 แผนภาพ DFD Level 2 โปรเซสที่ 6 การบล็อกและปลดบล็อกผู้ใช้งาน (Block Management)' },
    { num: 7, file: 'dfd_level2_p7.png', title: '14) แผนภาพ DFD Level 2 โปรเซสที่ 7 การสร้างและเผยแพร่โพสต์ข่าวสาร (Post Creation & Media)', caption: 'ภาพที่ 3.19 แผนภาพ DFD Level 2 โปรเซสที่ 7 การสร้างและเผยแพร่โพสต์ข่าวสาร (Post Creation & Media)' },

    // กลุ่มที่ 3: ฝั่งสมาชิก (Member ส่วนที่ 2: ปฏิสัมพันธ์และชุมชน) - โปรเซสที่ 8 ถึง 14 (ตรงตาม DFD Level 1 ส่วนที่ 3)
    { num: 8, file: 'dfd_level2_p8.png', title: '15) แผนภาพ DFD Level 2 โปรเซสที่ 8 การแก้ไขและลบโพสต์ข่าวสาร (Post Editing & Deletion)', caption: 'ภาพที่ 3.20 แผนภาพ DFD Level 2 โปรเซสที่ 8 การแก้ไขและลบโพสต์ข่าวสาร (Post Editing & Deletion)' },
    { num: 9, file: 'dfd_level2_p9.png', title: '16) แผนภาพ DFD Level 2 โปรเซสที่ 9 การดึงและประมวลผลฟีดข่าวสาร (Feed Processing)', caption: 'ภาพที่ 3.21 แผนภาพ DFD Level 2 โปรเซสที่ 9 การดึงและประมวลผลฟีดข่าวสาร (Feed Processing)' },
    { num: 10, file: 'dfd_level2_p10.png', title: '17) แผนภาพ DFD Level 2 โปรเซสที่ 10 การกดถูกใจและบันทึกโพสต์ (Like & Bookmark Management)', caption: 'ภาพที่ 3.22 แผนภาพ DFD Level 2 โปรเซสที่ 10 การกดถูกใจและบันทึกโพสต์ (Like & Bookmark Management)' },
    { num: 11, file: 'dfd_level2_p11.png', title: '18) แผนภาพ DFD Level 2 โปรเซสที่ 11 การแสดงความคิดเห็น (Comments Management)', caption: 'ภาพที่ 3.23 แผนภาพ DFD Level 2 โปรเซสที่ 11 การแสดงความคิดเห็น (Comments Management)' },
    { num: 12, file: 'dfd_level2_p12.png', title: '19) แผนภาพ DFD Level 2 โปรเซสที่ 12 การตอบกลับความคิดเห็นย่อย (Nested Replies Management)', caption: 'ภาพที่ 3.24 แผนภาพ DFD Level 2 โปรเซสที่ 12 การตอบกลับความคิดเห็นย่อย (Nested Replies Management)' },
    { num: 13, file: 'dfd_level2_p13.png', title: '20) แผนภาพ DFD Level 2 โปรเซสที่ 13 การสร้างและตั้งค่ากลุ่มชุมชน (Community Creation & Setup)', caption: 'ภาพที่ 3.25 แผนภาพ DFD Level 2 โปรเซสที่ 13 การสร้างและตั้งค่ากลุ่มชุมชน (Community Creation & Setup)' },
    { num: 14, file: 'dfd_level2_p14.png', title: '21) แผนภาพ DFD Level 2 โปรเซสที่ 14 การจัดการสมาชิกชุมชนและแต่งตั้งสิทธิ์ (Community Member Moderation)', caption: 'ภาพที่ 3.26 แผนภาพ DFD Level 2 โปรเซสที่ 14 การจัดการสมาชิกชุมชนและแต่งตั้งสิทธิ์ (Community Member Moderation)' }
  ];

  dfdLevel2List.forEach((item, index) => {
    const isFirstOnPage = (index > 0 && index % 2 === 0);
    sec1Elements.push(createPara(item.title, { 
      indent: { left: 400 }, 
      bold: true, 
      spaceBefore: isFirstOnPage ? 30 : 100, 
      spaceAfter: 30,
      keepWithNext: true,
      pageBreakBefore: isFirstOnPage
    }));
    sec1Elements.push(...createImageBlock(path.join(imgBase, item.file), item.caption, 430, 220));
  });

  // ER Diagram
  sec1Elements.push(createHeading3("3.3.2 ความสัมพันธ์ของฐานข้อมูล (Entity Relationship Diagram)", { pageBreakBefore: true }));
  sec1Elements.push(...createImageBlock(
    'd:/ConnecXus/wordadmin/Word/Untitled.png',
    "ภาพที่ 3.27 แผนภาพความสัมพันธ์ของข้อมูล (Entity Relationship Diagram) ระบบ ConnecXus ทั้งหมด 17 ตาราง",
    410,
    526
  ));

  // ==========================================
  // SECTION 2: LANDSCAPE (3.3.3 Data Dictionary 17 Tables)
  // ==========================================
  const sec2Elements = [];
  
  sec2Elements.push(createHeading3("3.3.3 พจนานุกรมข้อมูล (Data Dictionary)"));
  sec2Elements.push(createPara("พจนานุกรมข้อมูลแสดงโครงสร้างและรายละเอียดของตารางข้อมูลทั้ง 17 ตารางในฐานข้อมูลระบบ ConnecXus โดยจัดแสดงในรูปแบบตารางแนวนอนดังนี้:"));

  const table1 = [
    ["id", "รหัสประจำตัวผู้ใช้งาน", "INT UNSIGNED", "PK", "-", "1"],
    ["username", "ชื่อผู้ใช้สำหรับเข้าระบบ", "VARCHAR(50)", "-", "-", "panupong"],
    ["email", "อีเมลประจำบัญชี", "VARCHAR(100)", "-", "-", "panupong@gmail.com"],
    ["password_hash", "รหัสผ่านที่เข้ารหัส Bcrypt", "VARCHAR(255)", "-", "-", "$2b$10$abcdef..."],
    ["display_name", "ชื่อแสดงในโปรไฟล์", "VARCHAR(100)", "-", "-", "Panupong Dev"],
    ["avatar_url", "ที่อยู่ไฟล์รูปโปรไฟล์", "VARCHAR(500)", "-", "-", "/uploads/avatars/user1.png"],
    ["banner_url", "ที่อยู่ไฟล์รูปหน้าปก", "VARCHAR(500)", "-", "-", "/uploads/banners/banner1.jpg"],
    ["bio", "คำอธิบายแนะนำตัวย่อ", "TEXT", "-", "-", "Full-stack Developer"],
    ["role", "บทบาทสิทธิ์ (user, admin)", "ENUM", "-", "-", "user"],
    ["is_banned", "สถานะถูกระงับบัญชี (1=แบน, 0=ปกติ)", "TINYINT(1)", "-", "-", "0"],
    ["banned_until", "วันที่สิ้นสุดการระงับบัญชี", "DATETIME", "-", "-", "NULL"],
    ["ban_reason", "เหตุผลในการระงับบัญชี", "TEXT", "-", "-", "NULL"],
    ["created_at", "วันเวลาที่สร้างบัญชี", "DATETIME", "-", "-", "2026-08-25 10:00:00"],
    ["updated_at", "วันเวลาที่อัปเดตข้อมูลล่าสุด", "DATETIME", "-", "-", "2026-08-27 15:30:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 1 ตารางข้อมูลผู้ใช้งาน (users)", "users", table1));

  const table2 = [
    ["id", "รหัสประจำโพสต์", "INT UNSIGNED", "PK", "-", "1"],
    ["user_id", "รหัสผู้สร้างโพสต์", "INT UNSIGNED", "FK", "users(id)", "1"],
    ["community_id", "รหัสกลุ่มชุมชน (ถ้าโพสต์ในกลุ่ม)", "INT UNSIGNED", "FK", "communities(id)", "NULL"],
    ["content", "เนื้อหาข้อความโพสต์", "TEXT", "-", "-", "ยินดีต้อนรับสู่ระบบ ConnecXus!"],
    ["visibility", "ระดับการมองเห็น (public, followers, private)", "ENUM", "-", "-", "public"],
    ["is_deleted", "สถานะการลบโพสต์ (1=ลบ, 0=ปกติ)", "TINYINT(1)", "-", "-", "0"],
    ["created_at", "วันเวลาที่โพสต์", "DATETIME", "-", "-", "2026-08-25 10:30:00"],
    ["updated_at", "วันเวลาที่แก้ไขโพสต์", "DATETIME", "-", "-", "2026-08-25 10:30:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 2 ตารางข้อมูลโพสต์ (posts)", "posts", table2));

  const table3 = [
    ["id", "รหัสไฟล์สื่อมีเดีย", "INT UNSIGNED", "PK", "-", "1"],
    ["post_id", "รหัสโพสต์ที่แนบไฟล์", "INT UNSIGNED", "FK", "posts(id)", "1"],
    ["media_url", "ที่อยู่ไฟล์รูปภาพ/วิดีโอ", "VARCHAR(500)", "-", "-", "/uploads/posts/media1.jpg"],
    ["media_type", "ประเภทไฟล์มีเดีย (image, video)", "VARCHAR(50)", "-", "-", "image"],
    ["created_at", "วันเวลาที่อัปโหลด", "DATETIME", "-", "-", "2026-08-25 10:30:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 3 ตารางข้อมูลสื่อแนบในโพสต์ (post_media)", "post_media", table3));

  const table4 = [
    ["id", "รหัสกลุ่มชุมชน", "INT UNSIGNED", "PK", "-", "1"],
    ["name", "ชื่อกลุ่มชุมชน", "VARCHAR(100)", "-", "-", "Web Developer Community"],
    ["slug", "ชื่อระบุใน URL ของกลุ่ม", "VARCHAR(100)", "-", "-", "web-dev-th"],
    ["description", "คำอธิบายรายละเอียดกลุ่ม", "TEXT", "-", "-", "ชุมชนแบ่งปันความรู้ด้านการพัฒนาเว็บ"],
    ["avatar_url", "รูปไอคอนกลุ่ม", "VARCHAR(500)", "-", "-", "/uploads/communities/icon1.png"],
    ["banner_url", "รูปภาพแบนเนอร์กลุ่ม", "VARCHAR(500)", "-", "-", "/uploads/communities/banner1.jpg"],
    ["creator_id", "รหัสผู้สร้างกลุ่มชุมชน", "INT UNSIGNED", "FK", "users(id)", "1"],
    ["privacy", "สถานะความเป็นส่วนตัว (public, private)", "ENUM", "-", "-", "public"],
    ["created_at", "วันเวลาที่สร้างกลุ่ม", "DATETIME", "-", "-", "2026-08-25 11:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 4 ตารางข้อมูลกลุ่มชุมชน (communities)", "communities", table4));

  const table5 = [
    ["id", "รหัสสมาชิกในกลุ่ม", "INT UNSIGNED", "PK", "-", "1"],
    ["community_id", "รหัสกลุ่มชุมชน", "INT UNSIGNED", "FK", "communities(id)", "1"],
    ["user_id", "รหัสผู้ใช้งานที่เป็นสมาชิก", "INT UNSIGNED", "FK", "users(id)", "2"],
    ["role", "บทบาทในกลุ่ม (owner, admin, moderator, member)", "ENUM", "-", "-", "member"],
    ["joined_at", "วันเวลาที่เข้าร่วมกลุ่ม", "DATETIME", "-", "-", "2026-08-25 12:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 5 ตารางข้อมูลสมาชิกกลุ่มชุมชน (community_members)", "community_members", table5));

  const table6 = [
    ["id", "รหัสกฎชุมชน", "INT UNSIGNED", "PK", "-", "1"],
    ["community_id", "รหัสกลุ่มชุมชน", "INT UNSIGNED", "FK", "communities(id)", "1"],
    ["rule_number", "ลำดับข้อของกฎ", "INT", "-", "-", "1"],
    ["title", "หัวข้อกฎระเบียบ", "VARCHAR(255)", "-", "-", "สุภาพและให้เกียรติสมาชิกท่านอื่น"],
    ["description", "รายละเอียดของกฎระเบียบ", "TEXT", "-", "-", "ห้ามใช้ถ้อยคำหยาบคายหรือเสียดสี"],
    ["created_at", "วันเวลาที่สร้างกฎ", "DATETIME", "-", "-", "2026-08-25 11:30:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 6 ตารางข้อมูลกฎระเบียบกลุ่มชุมชน (community_rules)", "community_rules", table6));

  const table7 = [
    ["id", "รหัสลิงก์เชิญ", "INT UNSIGNED", "PK", "-", "1"],
    ["community_id", "รหัสกลุ่มชุมชน", "INT UNSIGNED", "FK", "communities(id)", "1"],
    ["code", "รหัสโค้ดสำหรับลิงก์เชิญ (Unique)", "VARCHAR(64)", "-", "-", "invite_abc123xyz789"],
    ["creator_id", "รหัสผู้สร้างลิงก์เชิญ", "INT UNSIGNED", "FK", "users(id)", "1"],
    ["max_uses", "จำนวนครั้งสูงสุดที่ใช้ได้", "INT", "-", "-", "100"],
    ["used_count", "จำนวนครั้งที่ถูกใช้งานแล้ว", "INT", "-", "-", "15"],
    ["expires_at", "วันเวลาหมดอายุของลิงก์", "DATETIME", "-", "-", "2026-09-01 00:00:00"],
    ["created_at", "วันเวลาที่สร้างลิงก์", "DATETIME", "-", "-", "2026-08-25 14:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 7 ตารางข้อมูลลิงก์เชิญเข้ากลุ่ม (community_invites)", "community_invites", table7));

  const table8 = [
    ["id", "รหัสคำขอเข้าร่วม", "INT UNSIGNED", "PK", "-", "1"],
    ["community_id", "รหัสกลุ่มชุมชน", "INT UNSIGNED", "FK", "communities(id)", "1"],
    ["user_id", "รหัสผู้ยื่นคำขอเข้าร่วม", "INT UNSIGNED", "FK", "users(id)", "3"],
    ["status", "สถานะคำขอ (pending, approved, rejected)", "ENUM", "-", "-", "pending"],
    ["created_at", "วันเวลาที่ส่งคำขอ", "DATETIME", "-", "-", "2026-08-25 15:00:00"],
    ["reviewed_by", "รหัสผู้ตรวจอนุมัติคำขอ", "INT UNSIGNED", "FK", "users(id)", "NULL"],
    ["reviewed_at", "วันเวลาที่ตรวจสอบ", "DATETIME", "-", "-", "NULL"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 8 ตารางข้อมูลคำขอเข้าร่วมกลุ่ม (community_join_requests)", "community_join_requests", table8));

  const table9 = [
    ["id", "รหัสความคิดเห็น", "INT UNSIGNED", "PK", "-", "1"],
    ["post_id", "รหัสโพสต์ที่แสดงความเห็น", "INT UNSIGNED", "FK", "posts(id)", "1"],
    ["user_id", "รหัสผู้แสดงความคิดเห็น", "INT UNSIGNED", "FK", "users(id)", "2"],
    ["parent_id", "รหัสความคิดเห็นหลัก (สำหรับ Nested Reply)", "INT UNSIGNED", "FK", "comments(id)", "NULL"],
    ["content", "ข้อความความคิดเห็น", "TEXT", "-", "-", "ยอดเยี่ยมมากครับระบบใช้งานง่าย"],
    ["is_deleted", "สถานะการลบความคิดเห็น", "TINYINT(1)", "-", "-", "0"],
    ["created_at", "วันเวลาที่แสดงความคิดเห็น", "DATETIME", "-", "-", "2026-08-25 17:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 9 ตารางข้อมูลความคิดเห็นบนโพสต์ (comments)", "comments", table9));

  const table10 = [
    ["id", "รหัสห้องสนทนา", "INT", "PK", "-", "1"],
    ["type", "ประเภทห้อง (direct, group)", "VARCHAR(50)", "-", "-", "direct"],
    ["name", "ชื่อห้องสนทนา", "VARCHAR(255)", "-", "-", "ห้องพูดคุยทีมงาน"],
    ["avatar_url", "รูปภาพประจำห้องสนทนา", "VARCHAR(500)", "-", "-", "/uploads/chats/room1.png"],
    ["theme_color", "สีธีมประจำห้องสนทนา", "VARCHAR(50)", "-", "-", "var(--brand)"],
    ["quick_emoji", "อิโมจิด่วนประจำห้อง", "VARCHAR(10)", "-", "-", "👍"],
    ["created_at", "วันเวลาที่สร้างห้อง", "TIMESTAMP", "-", "-", "2026-08-25 18:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 10 ตารางข้อมูลห้องสนทนา (conversations)", "conversations", table10));

  const table11 = [
    ["conversation_id", "รหัสห้องสนทนา", "INT", "PK, FK", "conversations(id)", "1"],
    ["user_id", "รหัสผู้เข้าร่วมสนทนา", "INT", "PK, FK", "users(id)", "1"],
    ["role", "บทบาทในห้อง (owner, member)", "VARCHAR(20)", "-", "-", "owner"],
    ["last_read_at", "วันเวลาที่อ่านข้อความล่าสุด", "TIMESTAMP", "-", "-", "2026-08-27 18:30:00"],
    ["is_muted", "สถานะปิดการแจ้งเตือน", "BOOLEAN", "-", "-", "0"],
    ["joined_at", "วันเวลาที่เข้าร่วมห้อง", "TIMESTAMP", "-", "-", "2026-08-25 18:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 11 ตารางข้อมูลผู้เข้าร่วมห้องสนทนา (conversation_participants)", "conversation_participants", table11));

  const table12 = [
    ["id", "รหัสข้อความแชท", "INT", "PK", "-", "1"],
    ["conversation_id", "รหัสห้องสนทนา", "INT", "FK", "conversations(id)", "1"],
    ["sender_id", "รหัสผู้ส่งข้อความ", "INT", "FK", "users(id)", "1"],
    ["content", "เนื้อหาข้อความแชท", "TEXT", "-", "-", "สวัสดีครับ ยินดีที่ได้รู้จัก"],
    ["image_url", "ที่อยู่ไฟล์รูปภาพในแชท", "VARCHAR(500)", "-", "-", "/uploads/chat/img1.jpg"],
    ["audio_url", "ที่อยู่ไฟล์คลิปเสียง", "VARCHAR(500)", "-", "-", "/uploads/chat/voice1.webm"],
    ["is_pinned", "สถานะการปักหมุดข้อความ", "BOOLEAN", "-", "-", "0"],
    ["is_edited", "สถานะเคยแก้ไขข้อความ", "BOOLEAN", "-", "-", "0"],
    ["is_read", "สถานะการอ่านข้อความ", "BOOLEAN", "-", "-", "1"],
    ["created_at", "วันเวลาที่ส่งข้อความ", "TIMESTAMP", "-", "-", "2026-08-25 18:05:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 12 ตารางข้อมูลข้อความแชท (messages)", "messages", table12));

  const table13 = [
    ["id", "รหัสการแจ้งเตือน", "INT UNSIGNED", "PK", "-", "1"],
    ["user_id", "รหัสผู้รับการแจ้งเตือน", "INT UNSIGNED", "FK", "users(id)", "1"],
    ["sender_id", "รหัสผู้กระทำ (ผู้กดไลก์/คอมเมนต์)", "INT UNSIGNED", "FK", "users(id)", "2"],
    ["type", "ประเภท (like, comment, follow)", "ENUM", "-", "-", "like"],
    ["post_id", "รหัสโพสต์ที่เกี่ยวข้อง", "INT UNSIGNED", "FK", "posts(id)", "1"],
    ["is_read", "สถานะเปิดอ่านแล้ว", "BOOLEAN", "-", "-", "0"],
    ["created_at", "วันเวลาที่แจ้งเตือน", "DATETIME", "-", "-", "2026-08-25 18:10:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 13 ตารางข้อมูลการแจ้งเตือน (notifications)", "notifications", table13));

  const table14 = [
    ["id", "รหัสรายงานปัญหา", "INT UNSIGNED", "PK", "-", "1"],
    ["reporter_id", "รหัสผู้ส่งรายงาน", "INT UNSIGNED", "FK", "users(id)", "2"],
    ["target_type", "ประเภทเป้าหมาย (user, post, comment, message, community)", "ENUM", "-", "-", "post"],
    ["reported_user_id", "รหัสผู้ใช้ที่ถูกรายงาน", "INT UNSIGNED", "FK", "users(id)", "NULL"],
    ["reported_post_id", "รหัสโพสต์ที่ถูกรายงาน", "INT UNSIGNED", "FK", "posts(id)", "3"],
    ["reported_comment_id", "รหัสคอมเมนต์ที่ถูกรายงาน", "INT UNSIGNED", "FK", "comments(id)", "NULL"],
    ["reported_message_id", "รหัสข้อความที่ถูกรายงาน", "INT UNSIGNED", "FK", "messages(id)", "NULL"],
    ["reported_community_id", "รหัสกลุ่มชุมชนที่ถูกรายงาน", "INT UNSIGNED", "FK", "communities(id)", "NULL"],
    ["community_id", "รหัสกลุ่มที่เกิดปัญหา", "INT UNSIGNED", "FK", "communities(id)", "NULL"],
    ["reason", "เหตุผลรายละเอียดการรายงาน", "TEXT", "-", "-", "มีเนื้อหาสแปมและข้อความรบกวน"],
    ["status", "สถานะรายงาน (pending, reviewed, resolved)", "ENUM", "-", "-", "pending"],
    ["is_escalated", "ส่งต่อให้แอดมินส่วนกลาง (1=ส่ง, 0=ไม่)", "TINYINT(1)", "-", "-", "0"],
    ["admin_note", "บันทึกการดำเนินการของแอดมิน", "TEXT", "-", "-", "ดำเนินการลบโพสต์และตักเตือน"],
    ["created_at", "วันเวลาที่ส่งรายงาน", "DATETIME", "-", "-", "2026-08-26 10:00:00"],
    ["updated_at", "วันเวลาที่อัปเดตสถานะ", "DATETIME", "-", "-", "2026-08-26 11:30:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 14 ตารางข้อมูลรายงานปัญหา (reports)", "reports", table14));

  const table15 = [
    ["blocker_id", "รหัสผู้ใช้ที่ทำการบล็อก", "INT", "PK, FK", "users(id)", "1"],
    ["blocked_id", "รหัสผู้ใช้ที่ถูกบล็อก", "INT", "PK, FK", "users(id)", "3"],
    ["created_at", "วันเวลาที่ทำการบล็อก", "TIMESTAMP", "-", "-", "2026-08-26 14:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 15 ตารางข้อมูลการบล็อกผู้ใช้ (user_blocks)", "user_blocks", table15));

  const table16 = [
    ["id", "รหัสบันทึกกิจกรรมแอดมิน", "INT UNSIGNED", "PK", "-", "1"],
    ["admin_id", "รหัสแอดมินผู้กระทำ", "INT UNSIGNED", "FK", "users(id)", "1"],
    ["action", "คำสั่งการกระทำ (BAN_USER, DELETE_POST)", "VARCHAR(100)", "-", "-", "BAN_USER"],
    ["target_type", "ประเภทเป้าหมายที่ถูกจัดการ", "VARCHAR(50)", "-", "-", "user"],
    ["target_id", "รหัสไอดีของเป้าหมาย", "INT UNSIGNED", "-", "-", "3"],
    ["details", "รายละเอียดเพิ่มเติม", "TEXT", "-", "-", "แบนผู้ใช้งานเนื่องจากทำผิดกฎชุมชน"],
    ["created_at", "วันเวลาที่กระทำกิจกรรม", "DATETIME", "-", "-", "2026-08-26 15:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 16 ตารางข้อมูลบันทึกกิจกรรมระบบ (system_logs)", "system_logs", table16));

  const table17 = [
    ["id", "รหัสบันทึกความปลอดภัย", "INT", "PK", "-", "1"],
    ["user_id", "รหัสผู้ใช้งาน", "INT", "FK", "users(id)", "1"],
    ["event_type", "ประเภทเหตุการณ์ (LOGIN_SUCCESS, PASSWORD_CHANGED)", "VARCHAR(100)", "-", "-", "LOGIN_SUCCESS"],
    ["ip_address", "หมายเลขไอพีแอดเดรส", "VARCHAR(50)", "-", "-", "127.0.0.1"],
    ["user_agent", "เบราว์เซอร์และระบบปฏิบัติการ", "TEXT", "-", "-", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"],
    ["status", "ผลลัพธ์ (success, failed)", "ENUM", "-", "-", "success"],
    ["created_at", "วันเวลาที่เกิดเหตุการณ์", "TIMESTAMP", "-", "-", "2026-08-27 10:00:00"]
  ];
  sec2Elements.push(...createDictTableLandscape("ตารางที่ 17 ตารางข้อมูลประวัติความปลอดภัย (security_logs)", "security_logs", table17));

  // ==========================================
  // SECTION 3: Portrait (3.3.4 Site Map & 3.4 Screen Designs)
  // ==========================================
  const sec3Elements = [];

  // Section 3.3.4 Site Map
  sec3Elements.push(createHeading3("3.3.4 ผังโครงสร้างเว็บไซต์ (Site Map)"));
  sec3Elements.push(createPara("3.3.4.1 ส่วนของผู้ดูแลระบบ (Admin Dashboard & Management)", { bold: true, indent: { left: 400 } }));
  sec3Elements.push(...createImageBlock(
    path.join(imgBase, 'sitemap_admin.png'),
    "ภาพที่ 3.28 ผังโครงสร้างเว็บไซต์ส่วนของผู้ดูแลระบบ (Admin Site Map)",
    480,
    460
  ));
  sec3Elements.push(createPara("3.3.4.2 ส่วนของผู้ใช้งานทั่วไปและสมาชิก (User & Member Section)", { bold: true, indent: { left: 400 }, spaceBefore: 140, pageBreakBefore: true }));
  sec3Elements.push(...createImageBlock(
    path.join(imgBase, 'sitemap_user.png'),
    "ภาพที่ 3.29 ผังโครงสร้างเว็บไซต์ส่วนของผู้ใช้งานทั่วไปและสมาชิก (User Site Map)",
    480,
    460
  ));

  // Section 3.4 ออกแบบหน้าจอโปรแกรม
  sec3Elements.push(createHeading2("3.4 ออกแบบหน้าจอโปรแกรม", { pageBreakBefore: true }));
  sec3Elements.push(createPara("การออกแบบส่วนติดต่อผู้ใช้งาน (UI/UX) ของระบบเครือข่ายสังคมออนไลน์ ConnecXus ได้รับการออกแบบให้มีความสวยงาม ทันสมัย ใช้งานง่าย และตอบสนองต่อทุกอุปกรณ์ (Responsive Design) โดยแบ่งการจัดแสดงหน้าจอออกเป็น 2 ส่วนหลัก โดยนำเสนอส่วนของผู้ดูแลระบบก่อน ดังนี้:"));

  // 3.4.1 Admin Section
  sec3Elements.push(createHeading3("3.4.1 ส่วนการทำงานของผู้ดูแลระบบ (Admin Panel & Moderation Management)", { bold: true, spaceBefore: 120 }));

  const screenshotBase = 'd:/ConnecXus/wordadmin/screenshots';
  const adminScreenshots = [
    { file: "Screenshot 2026-08-28 004705.png", title: "ภาพที่ 3.30 แผงควบคุมผู้ดูแลระบบ - แดชบอร์ดภาพรวมสถิติ (Admin Panel - Dashboard Overview)" },
    { file: "Screenshot 2026-08-28 004713.png", title: "ภาพที่ 3.31 แผงควบคุมผู้ดูแลระบบ - จัดการบัญชีผู้ใช้งาน (Admin Panel - User Management)" },
    { file: "Screenshot 2026-08-28 004719.png", title: "ภาพที่ 3.32 แผงควบคุมผู้ดูแลระบบ - ห้องแยกบัญชีที่ถูกระงับ (Admin Panel - Banned Accounts Vault)" },
    { file: "Screenshot 2026-08-28 004727.png", title: "ภาพที่ 3.33 แผงควบคุมผู้ดูแลระบบ - จัดการกลุ่มชุมชนทั้งหมด (Admin Panel - Community Management)" },
    { file: "Screenshot 2026-08-28 004735.png", title: "ภาพที่ 3.34 แผงควบคุมผู้ดูแลระบบ - ประวัติและการจัดการรายงานปัญหา (Admin Panel - Reports Management)" },
    { file: "Screenshot 2026-08-28 004853.png", title: "ภาพที่ 3.35 แผงควบคุมผู้ดูแลระบบ - บันทึกประวัติกิจกรรมระบบ System Logs (Admin Panel - System Logs)" },
    { file: "Screenshot 2026-08-28 004438.png", title: "ภาพที่ 3.36 หน้าแผงควบคุมชุมชน - ข้อมูลทั่วไปของชุมชน (Community Settings - General Info)" },
    { file: "Screenshot 2026-08-28 004443.png", title: "ภาพที่ 3.37 หน้าแผงควบคุมชุมชน - กำหนดกฎกติกาของชุมชน (Community Settings - Rules)" },
    { file: "Screenshot 2026-08-28 004451.png", title: "ภาพที่ 3.38 หน้าแผงควบคุมชุมชน - จัดการความเป็นส่วนตัวและลิงก์เชิญ (Community Settings - Privacy & Invites)" },
    { file: "Screenshot 2026-08-28 004455.png", title: "ภาพที่ 3.39 หน้าแผงควบคุมชุมชน - จัดการสมาชิกและบทบาท (Community Settings - Members)" },
    { file: "Screenshot 2026-08-28 004500.png", title: "ภาพที่ 3.40 หน้าแผงควบคุมชุมชน - จัดการคำขอเข้าร่วมชุมชน (Community Settings - Join Requests)" },
    { file: "Screenshot 2026-08-28 004505.png", title: "ภาพที่ 3.41 หน้าแผงควบคุมชุมชน - จัดการรายงานปัญหาภายในกลุ่ม (Community Settings - Reports)" },
    { file: "Screenshot 2026-08-28 004509.png", title: "ภาพที่ 3.42 หน้าแผงควบคุมชุมชน - โซนอันตรายและการลบชุมชน (Community Settings - Danger Zone)" }
  ];

  adminScreenshots.forEach(item => {
    const fullPath = path.join(screenshotBase, item.file);
    sec3Elements.push(...createScreenshotImageBlock(fullPath, item.title, 500, 310));
  });

  // 3.4.2 User Section
  sec3Elements.push(createHeading3("3.4.2 ส่วนการทำงานของผู้ใช้งานทั่วไปและสมาชิก (User & Member Application)", { bold: true, spaceBefore: 140, pageBreakBefore: true }));

  const userScreenshots = [
    { file: "Screenshot 2026-08-28 001212.png", title: "ภาพที่ 3.43 หน้าจอลงทะเบียนสมัครสมาชิกใหม่ (Register)" },
    { file: "Screenshot 2026-08-28 001222.png", title: "ภาพที่ 3.44 หน้าจอเข้าสู่ระบบ - เลือกบัญชีผู้ใช้ที่บันทึกไว้ (Login - Saved Accounts)" },
    { file: "Screenshot 2026-08-28 001228.png", title: "ภาพที่ 3.45 หน้าจอเข้าสู่ระบบ - การกรอกรหัสผ่านบัญชี (Login - Password Input)" },
    { file: "Screenshot 2026-08-28 001236.png", title: "ภาพที่ 3.46 หน้าจอเข้าสู่ระบบ - สลับหรือเพิ่มบัญชีผู้ใช้งาน (Login - Switch Account)" },
    { file: "Screenshot 2026-08-28 001253.png", title: "ภาพที่ 3.47 หน้าจอเข้าสู่ระบบด้วย QR Code สแกนผ่านมือถือ (Login with QR Code)" },
    { file: "Screenshot 2026-08-28 001314.png", title: "ภาพที่ 3.48 หน้าแรกกระดานฟีดข่าวสารหลัก - แท็บสำหรับคุณ (Home Feed - For You)" },
    { file: "Screenshot 2026-08-28 001340.png", title: "ภาพที่ 3.49 หน้าแรกกระดานฟีดข่าวสารหลัก - แท็บกำลังติดตาม (Home Feed - Following)" },
    { file: "Screenshot 2026-08-28 004907.png", title: "ภาพที่ 3.50 เมนูดำเนินการกับโพสต์ - แก้ไข ลบ และเปลี่ยนความเป็นส่วนตัว (Post Action Menu)" },
    { file: "Screenshot 2026-08-28 001348.png", title: "ภาพที่ 3.51 หน้าสำรวจและเทรนด์ฮิต - แท็บมีอะไรเกิดขึ้นบ้าง (Explore & Trends - What's Happening)" },
    { file: "Screenshot 2026-08-28 001354.png", title: "ภาพที่ 3.52 หน้าสำรวจและเทรนด์ฮิต - แท็บแนะนำให้ติดตาม (Explore & Trends - Who to Follow)" },
    { file: "Screenshot 2026-08-28 001403.png", title: "ภาพที่ 3.53 หน้าระบบข้อความแชท - รายการกล่องข้อความสนทนา (Messages - Inbox List)" },
    { file: "Screenshot 2026-08-28 001420.png", title: "ภาพที่ 3.54 หน้าระบบข้อความแชท - ห้องสนทนาส่วนตัว (Direct Message Chat)" },
    { file: "Screenshot 2026-08-28 001556.png", title: "ภาพที่ 3.55 หน้าระบบข้อความแชท - การเลือกสติกเกอร์และข้อความเสียง (Voice Message & Sticker Picker)" },
    { file: "Screenshot 2026-08-28 001633.png", title: "ภาพที่ 3.56 หน้าระบบข้อความแชท - เมนูค้นหาและส่งภาพ GIF (GIF Search Picker)" },
    { file: "Screenshot 2026-08-28 001653.png", title: "ภาพที่ 3.57 หน้าระบบข้อความแชท - แถบเลือกอิโมจิ (Emoji Selector)" },
    { file: "Screenshot 2026-08-28 001700.png", title: "ภาพที่ 3.58 หน้าระบบข้อความแชท - แถบข้อมูลและการตั้งค่าห้องแชท (Chat Info & Settings Sidebar)" },
    { file: "Screenshot 2026-08-28 001716.png", title: "ภาพที่ 3.59 หน้าระบบข้อความแชท - เมนูปรับแต่งแชทและธีมสี (Chat Customization Options)" },
    { file: "Screenshot 2026-08-28 003721.png", title: "ภาพที่ 3.60 หน้าระบบข้อความแชท - ห้องสนทนากลุ่ม (Group Chat Conversation)" },
    { file: "Screenshot 2026-08-28 003730.png", title: "ภาพที่ 3.61 หน้าระบบข้อความแชท - สมาชิกกลุ่มและการตั้งค่าแชทกลุ่ม (Group Chat Members & Settings)" },
    { file: "Screenshot 2026-08-28 003736.png", title: "ภาพที่ 3.62 หน้าต่าง Modal เพิ่มสมาชิกเข้ากลุ่มแชท (Add Group Members Modal)" },
    { file: "Screenshot 2026-08-28 003746.png", title: "ภาพที่ 3.63 หน้าต่าง Modal สร้างกลุ่มแชทใหม่ (Create Group Chat Modal)" },
    { file: "Screenshot 2026-08-28 003811.png", title: "ภาพที่ 3.64 หน้าระบบข้อความแชท - รายการแชทที่จัดเก็บ (Archived Chats)" },
    { file: "Screenshot 2026-08-28 003828.png", title: "ภาพที่ 3.65 หน้าศูนย์รวมกลุ่มชุมชนและการค้นหากลุ่ม (Community Directory & Search)" },
    { file: "Screenshot 2026-08-28 003842.png", title: "ภาพที่ 3.66 หน้าต่าง Modal สร้างกลุ่มชุมชนใหม่ (Create Community Modal)" },
    { file: "invite_modal.png", title: "ภาพที่ 3.67 หน้าต่างตอบรับคำเชิญเข้าร่วมชุมชน (Community Join Invitation Modal)" },
    { file: "Screenshot 2026-08-28 003923.png", title: "ภาพที่ 3.68 หน้ารายละเอียดชุมชน - ฟีดกระดานโพสต์ภายในกลุ่ม (Community Detail - Feed Tab)" },
    { file: "Screenshot 2026-08-28 004403.png", title: "ภาพที่ 3.69 หน้ารายละเอียดชุมชน - เมนูเลือกระดับความเป็นส่วนตัวของการโพสต์ (Post Privacy Selection)" },
    { file: "Screenshot 2026-08-28 004427.png", title: "ภาพที่ 3.70 หน้ารายละเอียดชุมชน - แท็บรวมภาพและสื่อมีเดีย (Community Detail - Media Gallery)" },
    { file: "Screenshot 2026-08-28 004520.png", title: "ภาพที่ 3.71 หน้าศูนย์การแจ้งเตือน (Notifications Center)" },
    { file: "Screenshot 2026-08-28 004527.png", title: "ภาพที่ 3.72 หน้าบุ๊กมาร์กรายการโพสต์ที่บันทึกไว้ (Bookmarks Page)" },
    { file: "Screenshot 2026-08-28 004533.png", title: "ภาพที่ 3.73 หน้าโปรไฟล์ผู้ใช้งาน - แท็บโพสต์ (User Profile - Posts Tab)" },
    { file: "Screenshot 2026-08-28 004539.png", title: "ภาพที่ 3.74 หน้าโปรไฟล์ผู้ใช้งาน - แท็บรีโพสต์ (User Profile - Reposts Tab)" },
    { file: "Screenshot 2026-08-28 004544.png", title: "ภาพที่ 3.75 หน้าโปรไฟล์ผู้ใช้งาน - แท็บมีเดีย (User Profile - Media Tab)" },
    { file: "Screenshot 2026-08-28 004549.png", title: "ภาพที่ 3.76 หน้าโปรไฟล์ผู้ใช้งาน - แท็บถูกใจ (User Profile - Likes Tab)" },
    { file: "Screenshot 2026-08-28 004600.png", title: "ภาพที่ 3.77 หน้าต่าง Modal รายชื่อผู้ที่เรากำลังติดตาม (Following List Modal)" },
    { file: "Screenshot 2026-08-28 004606.png", title: "ภาพที่ 3.78 หน้าต่าง Modal รายชื่อผู้ติดตาม (Followers List Modal)" },
    { file: "Screenshot 2026-08-28 004619.png", title: "ภาพที่ 3.79 หน้าต่าง Modal แก้ไขข้อมูลโปรไฟล์ (Edit Profile Modal)" },
    { file: "Screenshot 2026-08-28 004626.png", title: "ภาพที่ 3.80 หน้าต่าง Modal การตั้งค่าบัญชีและการแสดงผล (Settings Modal)" },
    { file: "Screenshot 2026-08-28 004633.png", title: "ภาพที่ 3.81 หน้าการตั้งค่าความปลอดภัยของบัญชี (Account Security Settings)" },
    { file: "Screenshot 2026-08-28 004637.png", title: "ภาพที่ 3.82 หน้าต่าง Modal เปลี่ยนรหัสผ่านบัญชี (Change Password Modal)" },
    { file: "Screenshot 2026-08-28 004644.png", title: "ภาพที่ 3.83 หน้าต่าง Modal จัดการอีเมลของบัญชี (Manage Email Modal)" },
    { file: "Screenshot 2026-08-28 004650.png", title: "ภาพที่ 3.84 หน้าต่าง Modal เปลี่ยนชื่อผู้ใช้งาน (Change Username Modal)" }
  ];

  userScreenshots.forEach(item => {
    const fullPath = path.join(screenshotBase, item.file);
    sec3Elements.push(...createScreenshotImageBlock(fullPath, item.title, 500, 310));
  });

  // ==========================================
  // SECTION 4: LANDSCAPE (3.5 System Testing / Test Cases 54 Tables)
  // ==========================================
  const sec4Elements = [];

  sec4Elements.push(createHeading2("3.5 การทดสอบระบบ"));
  sec4Elements.push(createPara("การทดสอบระบบเครือข่ายสังคมออนไลน์ ConnecXus ดำเนินการทดสอบความถูกต้องของการทำงานตามลำดับหน้าจอการออกแบบโปรแกรม (หัวข้อ 3.4) โดยแบ่งการทดสอบออกเป็น 2 ส่วนหลัก ดังนี้:"));

  sec4Elements.push(createHeading3("3.5.1 กรณีทดสอบส่วนของผู้ดูแลระบบ (Admin Panel & Moderation Test Cases)", { bold: true, spaceBefore: 120 }));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.1 กรณีทดสอบ: แผงควบคุมผู้ดูแลระบบ - แดชบอร์ดภาพรวมสถิติ (Admin Panel - Dashboard Overview)",
    "เข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ\n(/admin)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ตรวจสอบแดชบอร์ดภาพรวมสถิติ",
        step: "1. เรียกดูหน้าแดชบอร์ดหลัก (/admin)",
        data: "-",
        expect: "แสดงยอดรวมผู้ใช้งาน ชุมชน โพสต์ รายงานที่รอดำเนินการ และกราฟแนวโน้มสถิติถูกต้อง"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.2 กรณีทดสอบ: แผงควบคุมผู้ดูแลระบบ - จัดการบัญชีผู้ใช้งาน (Admin Panel - User Management)",
    "อยู่ที่หน้าแอดมินแท็บจัดการผู้ใช้\n(/admin/users)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ค้นหาและปรับเปลี่ยนสิทธิ์ผู้ใช้งาน",
        step: "1. ค้นหาชื่อผู้ใช้\n2. ปรับสิทธิ์เป็น Admin",
        data: "User: @armop, สิทธิ์ใหม่: admin",
        expect: "สิทธิ์ของผู้ใช้ในตาราง users อัปเดตทันที และบันทึก System Log"
      },
      {
        title: "สั่งระงับบัญชีผู้ใช้งาน (Ban User)",
        step: "1. ค้นหาผู้ใช้ที่ทำผิดกฎ\n2. กดปุ่ม \"ระงับบัญชี\" พร้อมระบุเหตุผล",
        data: "User: @bad_user, เหตุผล: ละเมิดกฎชุมชน",
        expect: "สถานะผู้ใช้เปลี่ยนเป็น is_banned=1 บันทึก System Log และผู้ใช้ถูกเตะออกจากระบบทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.3 กรณีทดสอบ: แผงควบคุมผู้ดูแลระบบ - ห้องแยกบัญชีที่ถูกระงับ (Admin Panel - Banned Accounts Vault)",
    "อยู่ที่หน้าแอดมินแท็บบัญชีที่ถูกแบน\n(/admin/banned)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ปลดการระงับบัญชีผู้ใช้งาน",
        step: "1. ค้นหาผู้ใช้ในห้อง Banned Vault\n2. กดปุ่ม \"ปลดระงับ\"",
        data: "User: @ooa",
        expect: "สถานะผู้ใช้เปลี่ยนเป็น is_banned=0 บันทึก Log และผู้ใช้กลับมาเข้าสู่ระบบได้ตามปกติ"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.4 กรณีทดสอบ: แผงควบคุมผู้ดูแลระบบ - จัดการกลุ่มชุมชนทั้งหมด (Admin Panel - Community Management)",
    "อยู่ที่หน้าแอดมินแท็บจัดการชุมชน\n(/admin/communities)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ตรวจสอบและจัดการกลุ่มชุมชนส่วนกลาง",
        step: "1. ตรวจสอบรายชื่อกลุ่ม\n2. สั่งระงับหรือลบกลุ่มที่ผิดกฎ",
        data: "Community ID: 4, Action: ระงับชุมชน",
        expect: "กลุ่มชุมชนถูกปิดกั้นการเข้าถึง และบันทึกลงตาราง system_logs"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.5 กรณีทดสอบ: แผงควบคุมผู้ดูแลระบบ - ประวัติและการจัดการรายงานปัญหา (Admin Panel - Reports Management)",
    "อยู่ที่หน้าแอดมินแท็บรายงาน\n(/admin/reports)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ตรวจสอบและยุติรายงานปัญหา",
        step: "1. ตรวจสอบหลักฐานโพสต์ที่ถูกรายงาน\n2. สั่งลบเนื้อหาและยุติรายงาน",
        data: "Report ID: 11, Action: ลบโพสต์",
        expect: "โพสต์ถูกลบ (is_deleted=1) สถานะรายงานเปลี่ยนเป็น resolved และบันทึก Audit Log"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.6 กรณีทดสอบ: แผงควบคุมผู้ดูแลระบบ - บันทึกประวัติกิจกรรมระบบ System Logs (Admin Panel - System Logs)",
    "อยู่ที่หน้าแอดมินแท็บระบบล็อก\n(/admin/logs)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ตรวจสอบและกรองค้นหาบันทึกระบบ (System Logs)",
        step: "1. กรองตามช่วงเวลา แอดมินผู้กระทำ หรือประเภทการกระทำ",
        data: "Filter: ช่วงเวลา ทั้งหมด, การกระทำ ทั้งหมด",
        expect: "แสดงตารางประวัติกิจกรรม รายละเอียดเป้าหมาย ไอพีแอดเนรส และวันเวลาอย่างครบถ้วน"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.7 กรณีทดสอบ: หน้าแผงควบคุมชุมชน - ข้อมูลทั่วไปของชุมชน (Community Settings - General Info)",
    "เข้าสู่หน้าตั้งค่าชุมชน\n(/community/:slug/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แก้ไขข้อมูลทั่วไปของชุมชน",
        step: "1. แก้ไขชื่อและคำอธิบายกลุ่ม\n2. กดปุ่มบันทึก",
        data: "คำอธิบายใหม่: \"ศูนย์รวมนักพัฒนาเว็บแอปพลิเคชันทั่วประเทศ\"",
        expect: "ข้อมูลชุมชนในตาราง communities ได้รับการอัปเดตและแสดงแจ้งเตือนสำเร็จ"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.8 กรณีทดสอบ: หน้าแผงควบคุมชุมชน - กำหนดกฎกติกาของชุมชน (Community Settings - Rules)",
    "อยู่ที่หน้าตั้งค่าชุมชนแท็บกฎระเบียบ\n(/community/:slug/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "กำหนดกฎระเบียบของชุมชน",
        step: "1. เพิ่มข้อกำหนดกฎระเบียบข้อบังคับ\n2. กดบันทึกกฎ",
        data: "กฎข้อที่ 1: \"สุภาพและให้เกียรติสมาชิกท่านอื่น\"",
        expect: "บันทึกลงตาราง community_rules และแสดงผลในหน้ารายละเอียดชุมชนให้สมาชิกอ่าน"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.9 กรณีทดสอบ: หน้าแผงควบคุมชุมชน - จัดการความเป็นส่วนตัวและลิงก์เชิญ (Community Settings - Privacy & Invites)",
    "อยู่ที่หน้าตั้งค่าชุมชนแท็บลิงก์เชิญ\n(/community/:slug/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "สร้างลิงก์เชิญเข้ากลุ่มชุมชน",
        step: "1. กำหนดอายุและจำนวนครั้งที่ใช้ได้\n2. กด \"สร้างลิงก์เชิญ\"",
        data: "อายุลิงก์: 7 วัน, จำนวนใช้งาน: 50 ครั้ง",
        expect: "สร้างรหัสโค้ดเชิญ Unique สำเร็จ พร้อมปุ่มคัดลอกลิงก์ให้สมาชิก"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.10 กรณีทดสอบ: หน้าแผงควบคุมชุมชน - จัดการสมาชิกและบทบาท (Community Settings - Members)",
    "อยู่ที่หน้าตั้งค่าชุมชนแท็บสมาชิก\n(/community/:slug/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ปรับบทบาทสมาชิกในกลุ่ม",
        step: "1. ค้นหาสมาชิกในกลุ่ม\n2. ปรับบทบาทเป็น Moderator",
        data: "User ID: 3, Role ใหม่: moderator",
        expect: "บทบาทสมาชิกในตาราง community_members เปลี่ยนแปลงและมีสิทธิ์ดูแลกลุ่มทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.11 กรณีทดสอบ: หน้าแผงควบคุมชุมชน - จัดการคำขอเข้าร่วมชุมชน (Community Settings - Join Requests)",
    "อยู่ที่หน้าตั้งค่าชุมชนแท็บคำขอ\n(/community/:slug/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "อนุมัติคำขอเข้าร่วมกลุ่ม",
        step: "1. ตรวจสอบรายชื่อผู้ขอเข้า\n2. กดปุ่ม \"อนุมัติ\"",
        data: "Request ID: 5, Action: อนุมัติ",
        expect: "ผู้ใช้ได้รับการอนุมัติและเปลี่ยนสถานะเป็นสมาชิกกลุ่มทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.12 กรณีทดสอบ: หน้าแผงควบคุมชุมชน - จัดการรายงานปัญหาภายในกลุ่ม (Community Settings - Reports)",
    "อยู่ที่หน้าตั้งค่าชุมชนแท็บรายงาน\n(/community/:slug/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "จัดการรายงานปัญหาในกลุ่ม",
        step: "1. ตรวจสอบโพสต์ที่ถูกรายงาน\n2. สั่งลบโพสต์ที่ละเมิดกฎ",
        data: "Report ID: 2, Action: ลบโพสต์",
        expect: "โพสต์ถูกลบออกจากกลุ่ม และสถานะรายงานเปลี่ยนเป็น resolved"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.13 กรณีทดสอบ: หน้าแผงควบคุมชุมชน - โซนอันตรายและการลบชุมชน (Community Settings - Danger Zone)",
    "อยู่ที่หน้าตั้งค่าชุมชนแท็บโซนอันตราย\n(/community/:slug/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ลบกลุ่มชุมชนถาวร",
        step: "1. พิมพ์ชื่อ Slug กลุ่มเพื่อยืนยัน\n2. กดปุ่ม \"ลบชุมชนนี้ถาวร\"",
        data: "Confirm Slug: nuxt-dev",
        expect: "ลบข้อมูลชุมชนออกจากฐานข้อมูล และนำทางกลับสู่หน้าศูนย์รวมชุมชน"
      }
    ]
  ));

  sec4Elements.push(createHeading3("3.5.2 กรณีทดสอบส่วนของผู้ใช้งานทั่วไปและสมาชิก (User & Member Application Test Cases)", { bold: true, spaceBefore: 140, pageBreakBefore: true }));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.14 กรณีทดสอบ: หน้าจอลงทะเบียนสมัครสมาชิกใหม่ (Register)",
    "เรียกใช้งานหน้าลงทะเบียน\n(/register)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ไม่กรอกข้อมูลในช่องที่จำเป็น",
        step: "1. เว้นว่างช่องข้อมูลที่จำเป็น\n2. กดปุ่ม \"สมัครสมาชิก\"",
        data: "ชื่อผู้ใช้: (ว่าง), รหัสผ่าน: (ว่าง)",
        expect: "แสดงข้อความแจ้งเตือน \"กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง\""
      },
      {
        title: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
        step: "1. กรอกรหัสผ่านและยืนยันไม่ตรงกัน\n2. กดปุ่ม \"สมัครสมาชิก\"",
        data: "รหัสผ่าน: 123456, ยืนยัน: 654321",
        expect: "แสดงข้อความแจ้งเตือน \"รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน\""
      },
      {
        title: "กรอกชื่อผู้ใช้ซ้ำในระบบ",
        step: "1. กรอกชื่อผู้ใช้ที่มีอยู่แล้วในระบบ\n2. กรอกข้อมูลอื่นๆ ครบถ้วน\n3. กดปุ่ม \"สมัครสมาชิก\"",
        data: "ชื่อผู้ใช้: arm, อีเมล: new@gmail.com",
        expect: "แสดงข้อความแจ้งเตือน \"ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ\""
      },
      {
        title: "กรอกข้อมูลถูกต้องครบถ้วน",
        step: "1. กรอกข้อมูลส่วนตัวถูกต้องครบถ้วนทุกช่อง\n2. กดปุ่ม \"สมัครสมาชิก\"",
        data: "ชื่อผู้ใช้: student01, อีเมล: std@gmail.com, รหัส: 12345678A",
        expect: "แสดงแจ้งเตือน \"สมัครสมาชิกสำเร็จ\" บันทึกข้อมูลลงฐานข้อมูล users และเข้าสู่ระบบอัตโนมัติ"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.15 กรณีทดสอบ: หน้าจอเข้าสู่ระบบ - เลือกบัญชีผู้ใช้ที่บันทึกไว้ (Login - Saved Accounts)",
    "เรียกใช้งานหน้าเข้าสู่ระบบ\n(/login)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เลือกบัญชีที่บันทึกไว้ในอุปกรณ์",
        step: "1. คลิกเลือกการ์ดบัญชีผู้ใช้ที่บันทึกไว้\n2. ตรวจสอบการเปลี่ยนหน้า",
        data: "เลือกบัญชี: @arm",
        expect: "ระบบแสดงรูปโปรไฟล์และช่องกรอกรหัสผ่านของบัญชี @arm ทันที"
      },
      {
        title: "ลบบัญชีที่บันทึกไว้ออกจากอุปกรณ์",
        step: "1. คลิกไอคอนลบบัญชีบนการ์ดที่บันทึกไว้",
        data: "บัญชี: @olduser",
        expect: "การ์ดบัญชีดังกล่าวถูกลบออกจากรายการบันทึกบนอุปกรณ์ทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.16 กรณีทดสอบ: หน้าจอเข้าสู่ระบบ - การกรอกรหัสผ่านบัญชี (Login - Password Input)",
    "อยู่ที่หน้ากรอกรหัสผ่านบัญชี\n(/login)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "กรอกรหัสผ่านไม่ถูกต้อง",
        step: "1. กรอกรหัสผ่านผิด\n2. กดปุ่ม \"เข้าสู่ระบบ\"",
        data: "ชื่อผู้ใช้: arm, รหัสผ่าน: 000000",
        expect: "แสดงข้อความแจ้งเตือน \"รหัสผ่านไม่ถูกต้อง\""
      },
      {
        title: "กรอกรหัสผ่านสมาชิกถูกต้อง",
        step: "1. กรอกรหัสผ่านสมาชิกถูกต้อง\n2. กดปุ่ม \"เข้าสู่ระบบ\"",
        data: "ชื่อผู้ใช้: arm, รหัสผ่าน: 12345678A",
        expect: "เข้าสู่ระบบสำเร็จ บันทึก JWT Token และนำทางไปยังหน้าแรกกระดานฟีด (/)"
      },
      {
        title: "กรอกรหัสผ่านผู้ดูแลระบบถูกต้อง",
        step: "1. กรอกรหัสผ่านแอดมินถูกต้อง\n2. กดปุ่ม \"เข้าสู่ระบบ\"",
        data: "ชื่อผู้ใช้: admin, รหัสผ่าน: admin1234",
        expect: "เข้าสู่ระบบสำเร็จ แสดงเมนูแอดมิน และนำทางไปยังหน้าแดชบอร์ด (/admin)"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.17 กรณีทดสอบ: หน้าจอเข้าสู่ระบบ - สลับหรือเพิ่มบัญชีผู้ใช้งาน (Login - Switch Account)",
    "เรียกใช้งานหน้าเข้าสู่ระบบ\n(/login)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "สลับเข้าสู่ระบบด้วยบัญชีอื่น",
        step: "1. คลิกปุ่ม \"ใช้บัญชีอื่น\"\n2. กรอกชื่อผู้ใช้และรหัสผ่านใหม่\n3. กดเข้าสู่ระบบ",
        data: "ชื่อผู้ใช้: student01, รหัสผ่าน: 12345678A",
        expect: "ฟอร์มเปลี่ยนเป็นช่องกรอกบัญชีใหม่ และเข้าสู่ระบบได้สำเร็จ"
      },
      {
        title: "กดลิงก์ไปหน้าสมัครสมาชิก",
        step: "1. คลิกที่ลิงก์ \"สมัครสมาชิก\"",
        data: "-",
        expect: "นำทางไปยังหน้าลงทะเบียนสมัครสมาชิกใหม่ (/register)"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.18 กรณีทดสอบ: หน้าจอเข้าสู่ระบบด้วย QR Code สแกนผ่านมือถือ (Login with QR Code)",
    "เรียกใช้งานหน้าเข้าสู่ระบบ\nแท็บ QR Code (/login)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "สร้าง Dynamic QR Code สำหรับยืนยันตัวตน",
        step: "1. คลิกแท็บ \"QR Code\"\n2. ตรวจสอบภาพคิวอาร์โค้ด",
        data: "Dynamic Token อายุ 2 นาที",
        expect: "ระบบสร้างภาพ QR Code สำหรับยืนยันตัวตนและเชื่อมต่อ WebSocket"
      },
      {
        title: "สแกน QR Code สำเร็จผ่านแอปมือถือ",
        step: "1. ใช้สมาร์ตโฟนสแกน QR Code\n2. กดยืนยันการเข้าสู่ระบบบนมือถือ",
        data: "Dynamic QR Token",
        expect: "หน้าจอบนคอมพิวเตอร์เข้าสู่ระบบอัตโนมัติผ่าน WebSocket และนำทางไปหน้าหลัก"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.19 กรณีทดสอบ: หน้าแรกกระดานฟีดข่าวสารหลัก - แท็บสำหรับคุณ (Home Feed - For You)",
    "เข้าสู่ระบบสำเร็จและอยู่หน้าแรก\n(/)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงกระดานฟีดสำหรับคุณ",
        step: "1. เปิดแท็บ \"สำหรับคุณ\"\n2. ตรวจสอบรายการโพสต์",
        data: "-",
        expect: "แสดงรายการโพสต์สาธารณะและโพสต์แนะนำตามลำดับเวลาล่าสุด"
      },
      {
        title: "สร้างโพสต์ข้อความ Rich Text",
        step: "1. พิมพ์ข้อความในกล่องโพสต์\n2. จัดตัวหนา ตัวเอียง\n3. กดปุ่ม \"โพสต์\"",
        data: "ข้อความ: \"ยินดีต้อนรับสู่ ConnecXus!\"",
        expect: "โพสต์ใหม่ปรากฏบนสุดของหน้าฟีดทันที และบันทึกลงฐานข้อมูลตาราง posts"
      },
      {
        title: "กดถูกใจโพสต์บนหน้าฟีด",
        step: "1. คลิกไอคอนหัวใจบนการ์ดโพสต์",
        data: "Post ID: 1",
        expect: "ไอคอนหัวใจเปลี่ยนสี ตัวเลขเพิ่มขึ้น 1 และส่งแจ้งเตือน Notification"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.20 กรณีทดสอบ: หน้าแรกกระดานฟีดข่าวสารหลัก - แท็บกำลังติดตาม (Home Feed - Following)",
    "อยู่ที่หน้าแรกกระดานฟีด\n(/)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "สลับดูโพสต์เฉพาะบุคคลที่กำลังติดตาม",
        step: "1. คลิกเลือกแท็บ \"กำลังติดตาม\"\n2. ตรวจสอบโพสต์ที่แสดง",
        data: "แท็บ: Following",
        expect: "แสดงเฉพาะโพสต์จากผู้ใช้งานและกลุ่มชุมชนที่เรากดติดตามเท่านั้น"
      },
      {
        title: "การโหลดโพสต์ต่อเนื่อง (Infinite Scroll)",
        step: "1. เลื่อนหน้าจอลงด้านล่างสุด",
        data: "Page: 2, Limit: 10",
        expect: "ระบบโหลดโพสต์ชุดถัดไปอย่างต่อเนื่องโดยไม่ต้องรีเฟรชหน้าเว็บ"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.21 กรณีทดสอบ: หน้าสำรวจและเทรนด์ฮิต - แท็บมีอะไรเกิดขึ้นบ้าง (Explore & Trends - What's Happening)",
    "เรียกใช้งานหน้าสำรวจ\n(/explore)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ค้นหาข้อมูลแบบเรียลไทม์ (Live Search)",
        step: "1. พิมพ์คำค้นหาในช่องค้นหาด้านบน\n2. ตรวจสอบผลลัพธ์",
        data: "คำค้นหา: \"เทคโนโลยี\", \"@arm\"",
        expect: "แสดงผลการค้นหาแบบ Live Search แยกประเภทโพสต์ ผู้ใช้ และแท็กทันที"
      },
      {
        title: "คลิกดูแฮชแท็กติดเทรนด์",
        step: "1. คลิกที่แฮชแท็กในแท็บ \"มีอะไรเกิดขึ้นบ้าง\"",
        data: "แฮชแท็ก: #connecxus",
        expect: "นำทางไปยังหน้ารวมโพสต์ทั้งหมดที่ติดแฮชแท็ก #connecxus"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.22 กรณีทดสอบ: หน้าสำรวจและเทรนด์ฮิต - แท็บแนะนำให้ติดตาม (Explore & Trends - Who to Follow)",
    "อยู่ที่หน้าสำรวจ\n(/explore)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงรายการผู้ใช้แนะนำ",
        step: "1. คลิกแท็บ \"แนะนำให้ติดตาม\"\n2. ตรวจสอบการ์ดผู้ใช้",
        data: "-",
        expect: "แสดงรายชื่อผู้ใช้งานแนะนำ ข้อมูลโปรไฟล์ และปุ่มกดติดตาม"
      },
      {
        title: "กดปุ่มติดตามผู้ใช้งาน",
        step: "1. คลิกปุ่ม \"ติดตาม\" บนการ์ดผู้ใช้",
        data: "User: @eor",
        expect: "สถานะเปลี่ยนเป็น \"กำลังติดตาม\" ทันที และบันทึกลงตาราง followers"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.23 กรณีทดสอบ: หน้าระบบข้อความแชท - รายการกล่องข้อความสนทนา (Messages - Inbox List)",
    "เรียกใช้งานหน้าระบบข้อความ\n(/messages)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงรายการกล่องข้อความสนทนา",
        step: "1. เปิดหน้าระบบข้อความ\n2. ตรวจสอบรายชื่อห้องสนทนา",
        data: "-",
        expect: "แสดงรายการห้องสนทนาล่าสุด ข้อความล่าสุด เวลา และสถานะออนไลน์ของคู่สนทนา"
      },
      {
        title: "ค้นหาห้องสนทนาในกล่องข้อความ",
        step: "1. พิมพ์ชื่อในช่องค้นหาแชท",
        data: "คำค้นหา: \"arm\"",
        expect: "กรองแสดงเฉพาะห้องสนทนาที่มีชื่อตรงกับคำค้นหา"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.24 กรณีทดสอบ: หน้าระบบข้อความแชท - ห้องสนทนาส่วนตัว (Direct Message Chat)",
    "เลือกห้องสนทนาส่วนตัว\n(/messages/:id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ส่งข้อความตัวอักษรแบบเรียลไทม์",
        step: "1. พิมพ์ข้อความในกล่องแชท\n2. กดปุ่มส่งข้อความ",
        data: "ข้อความ: \"สวัสดีครับ สบายดีไหมครับ\"",
        expect: "ข้อความแสดงในห้องแชททั้งสองฝั่งทันทีผ่าน WebSocket และบันทึกลงตาราง messages"
      },
      {
        title: "แสดงสถานะการอ่านข้อความ",
        step: "1. คู่สนทนาเปิดอ่านข้อความ",
        data: "Message ID: 15",
        expect: "สถานะเปลี่ยนเป็นอ่านแล้ว (is_read=1) และแสดงเครื่องหมายถูกสีฟ้า"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.25 กรณีทดสอบ: หน้าระบบข้อความแชท - การเลือกสติกเกอร์และข้อความเสียง (Voice Message & Sticker Picker)",
    "อยู่ในห้องสนทนาแชท\n(/messages/:id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "บันทึกและส่งข้อความเสียง (Voice Note)",
        step: "1. กดปุ่มไมโครโฟน\n2. บันทึกเสียง\n3. กดส่ง",
        data: "ไฟล์เสียง: voice_record.webm",
        expect: "อัปโหลดไฟล์เสียงและแสดงตัวเล่น Audio Player ในห้องแชททั้งสองฝั่งทันที"
      },
      {
        title: "เลือกและส่งสติกเกอร์",
        step: "1. คลิกไอคอนสติกเกอร์\n2. เลือกสติกเกอร์ที่ต้องการส่ง",
        data: "Sticker ID: sticker_01",
        expect: "ภาพสติกเกอร์แสดงในห้องสนทนาทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.26 กรณีทดสอบ: หน้าระบบข้อความแชท - เมนูค้นหาและส่งภาพ GIF (GIF Search Picker)",
    "อยู่ในห้องสนทนาแชท\n(/messages/:id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ค้นหาและส่งภาพเคลื่อนไหว GIF",
        step: "1. คลิกแท็บ GIF\n2. พิมพ์คำค้นหาและเลือกภาพ GIF",
        data: "คำค้นหา: \"happy\"",
        expect: "ภาพเคลื่อนไหว GIF ถูกส่งและแสดงในห้องแชททันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.27 กรณีทดสอบ: หน้าระบบข้อความแชท - แถบเลือกอิโมจิ (Emoji Selector)",
    "อยู่ในห้องสนทนาแชท\n(/messages/:id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แทรกอิโมจิลงในข้อความ",
        step: "1. คลิกไอคอนอิโมจิ\n2. เลือกอิโมจิที่ต้องการ",
        data: "Emoji: 😊, 🔥, 👍",
        expect: "อิโมจิถูกแทรกลงในช่องพิมพ์ข้อความตามตำแหน่งเคอร์เซอร์"
      },
      {
        title: "ส่งอิโมจิด่วนประจำห้อง (Quick Emoji)",
        step: "1. คลิกปุ่มอิโมจิด่วนที่มุมกล่องแชท",
        data: "Quick Emoji: 👍",
        expect: "ส่งอิโมจิด่วนไปยังห้องแชททันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.28 กรณีทดสอบ: หน้าระบบข้อความแชท - แถบข้อมูลและการตั้งค่าห้องแชท (Chat Info & Settings Sidebar)",
    "อยู่ในห้องสนทนาแชท\n(/messages/:id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เปิดดูแถบข้อมูลห้องแชท",
        step: "1. คลิกไอคอน Info ด้านขวาบน",
        data: "-",
        expect: "แสดงแถบข้อมูลคู่สนทนา สื่อที่แชร์ร่วมกัน และปุ่มตั้งค่าต่างๆ"
      },
      {
        title: "ปิดการแจ้งเตือนห้องแชท (Mute Chat)",
        step: "1. คลิกสลับปุ่ม \"ปิดการแจ้งเตือน\"",
        data: "Conversation ID: 3",
        expect: "สถานะเปลี่ยนเป็น is_muted=1 และไม่ส่งเสียงเตือนเมื่อมีข้อความใหม่"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.29 กรณีทดสอบ: หน้าระบบข้อความแชท - เมนูปรับแต่งแชทและธีมสี (Chat Customization Options)",
    "อยู่ที่แถบตั้งค่าห้องแชท\n(/messages/:id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เปลี่ยนสีธีมห้องแชท",
        step: "1. เลือกเมนู \"ปรับแต่งแชท\"\n2. เลือกสีธีมใหม่",
        data: "Theme: Blue Gradient",
        expect: "สีพื้นหลังและฟองข้อความของห้องแชทเปลี่ยนตามที่เลือกทันทีทั้งสองฝั่ง"
      },
      {
        title: "เปลี่ยนอิโมจิด่วนประจำห้อง",
        step: "1. เลือกเมนู \"เปลี่ยนอิโมจิ\"\n2. เลือกอิโมจิใหม่",
        data: "Quick Emoji: 🔥",
        expect: "ปุ่มอิโมจิด่วนของห้องแชทเปลี่ยนเป็นรูปที่เลือกทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.30 กรณีทดสอบ: หน้าระบบข้อความแชท - ห้องสนทนากลุ่ม (Group Chat Conversation)",
    "เข้าสู่ห้องสนทนากลุ่ม\n(/messages/:group_id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "รับส่งข้อความสดภายในกลุ่ม",
        step: "1. พิมพ์ข้อความในห้องกลุ่ม\n2. กดส่งข้อความ",
        data: "ข้อความ: \"นัดประชุมเวลา 14:00 น. ครับ\"",
        expect: "ข้อความส่งผ่าน WebSocket กระจายไปยังสมาชิกทุกคนในกลุ่มพร้อมกันแบบเรียลไทม์"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.31 กรณีทดสอบ: หน้าระบบข้อความแชท - สมาชิกกลุ่มและการตั้งค่าแชทกลุ่ม (Group Chat Members & Settings)",
    "เปิดแถบข้อมูลกลุ่มแชท\n(/messages/:group_id)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ตรวจสอบรายชื่อสมาชิกในกลุ่ม",
        step: "1. คลิกดูแท็บ \"สมาชิกกลุ่ม\"",
        data: "Group ID: 2",
        expect: "แสดงรายชื่อสมาชิกทั้งหมด บทบาท (Owner/Member) และสถานะออนไลน์"
      },
      {
        title: "ออกจากกลุ่มแชท",
        step: "1. คลิกปุ่ม \"ออกจากกลุ่ม\"\n2. กดยืนยัน",
        data: "-",
        expect: "ลบผู้ใช้ออกจากกลุ่ม ปิดหน้าต่างแชท และส่งแจ้งเตือนในกลุ่ม"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.32 กรณีทดสอบ: หน้าต่าง Modal เพิ่มสมาชิกเข้ากลุ่มแชท (Add Group Members Modal)",
    "เปิดหน้าต่างเพิ่มสมาชิกกลุ่มแชท\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เลือกและเพิ่มสมาชิกเข้ากลุ่ม",
        step: "1. ค้นหาชื่อเพื่อน\n2. ติ๊กเลือกรายชื่อ\n3. กดปุ่ม \"เพิ่มสมาชิก\"",
        data: "เพิ่มผู้ใช้: @student01",
        expect: "ผู้ใช้ถูกเพิ่มเข้ากลุ่มทันที และแสดงในรายการสมาชิกห้องแชท"
      },
      {
        title: "ปิดหน้าต่าง Modal",
        step: "1. คลิกปุ่ม \"ยกเลิก\" หรือไอคอนกากบาท (X)",
        data: "-",
        expect: "หน้าต่าง Modal ปิดลงและกลับสู่หน้าห้องแชทกลุ่ม"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.33 กรณีทดสอบ: หน้าต่าง Modal สร้างกลุ่มแชทใหม่ (Create Group Chat Modal)",
    "คลิกปุ่มสร้างกลุ่มแชทใหม่\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "สร้างกลุ่มแชทใหม่สำเร็จ",
        step: "1. กรอกชื่อกลุ่มแชท\n2. เลือกสมาชิกเริ่มต้น\n3. กดปุ่ม \"สร้างกลุ่ม\"",
        data: "ชื่อกลุ่ม: \"ทีมพัฒนา ConnecXus\", สมาชิก: @arm, @eor",
        expect: "สร้างห้องแชทกลุ่มสำเร็จ แต่งตั้งผู้สร้างเป็น Admin และเปิดหน้าห้องแชททันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.34 กรณีทดสอบ: หน้าระบบข้อความแชท - รายการแชทที่จัดเก็บ (Archived Chats)",
    "เรียกใช้งานหน้ารายการแชทที่จัดเก็บ\n(/messages/archived)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงรายการแชทที่จัดเก็บไว้",
        step: "1. เปิดหน้ารายการแชทที่จัดเก็บ",
        data: "-",
        expect: "แสดงรายการห้องสนทนาที่ถูกย้ายออกจากกล่องข้อความหลัก"
      },
      {
        title: "ยกเลิกการจัดเก็บห้องแชท (Unarchive Chat)",
        step: "1. คลิกเมนูบนห้องแชท\n2. เลือก \"ยกเลิกการจัดเก็บ\"",
        data: "Conversation ID: 5",
        expect: "ห้องแชทถูกย้ายกลับไปยังกล่องข้อความหลักทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.35 กรณีทดสอบ: หน้าศูนย์รวมกลุ่มชุมชนและการค้นหากลุ่ม (Community Directory & Search)",
    "เรียกใช้งานหน้าศูนย์รวมชุมชน\n(/community)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ค้นหาและเรียกดูชุมชนทั้งหมด",
        step: "1. เปิดหน้าศูนย์รวมชุมชน\n2. พิมพ์ชื่อกลุ่มในช่องค้นหา",
        data: "คำค้นหา: \"Developer\"",
        expect: "แสดงการ์ดชุมชน ข้อมูลจำนวนสมาชิก และปุ่มขอเข้าร่วมกลุ่ม"
      },
      {
        title: "กดเข้าร่วมกลุ่มชุมชนสาธารณะ",
        step: "1. คลิกปุ่ม \"เข้าร่วม\" บนการ์ดชุมชน",
        data: "Community: dev-club",
        expect: "เข้าเป็นสมาชิกกลุ่มทันที และปุ่มเปลี่ยนเป็น \"กำลังเป็นสมาชิก\""
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.36 กรณีทดสอบ: หน้าต่าง Modal สร้างกลุ่มชุมชนใหม่ (Create Community Modal)",
    "คลิกปุ่มสร้างชุมชน\n(/community)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "สร้างกลุ่มชุมชนใหม่สำเร็จ",
        step: "1. กรอกชื่อ Slug คำอธิบาย อัปโหลดรูปภาพ\n2. กดบันทึก",
        data: "ชื่อ: Nuxt Developer, Slug: nuxt-dev, สถานะ: สาธารณะ",
        expect: "สร้างชุมชนสำเร็จ แต่งตั้งผู้สร้างเป็น Owner และนำทางไปหน้ากลุ่มทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.37 กรณีทดสอบ: หน้าต่างตอบรับคำเชิญเข้าร่วมชุมชน (Community Join Invitation Modal)",
    "เปิดลิงก์คำเชิญชุมชน\n(/invite/:code)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ตรวจสอบการ์ดคำเชิญชุมชน",
        step: "1. เข้าสู่ลิงก์คำเชิญเข้าร่วมกลุ่ม\n2. ตรวจสอบข้อมูลกลุ่มและผู้สร้าง",
        data: "Code: 83ce518dee\n(Community: ez)",
        expect: "แสดงชื่อกลุ่ม จำนวนสมาชิก ผู้สร้าง และปุ่มตอบรับเข้าร่วมถูกต้อง"
      },
      {
        title: "กดยืนยันเข้าร่วมชุมชน",
        step: "1. คลิกปุ่ม \"เข้าร่วมชุมชน\"\n2. ยืนยันการเข้าเป็นสมาชิก",
        data: "Action: เข้าร่วมชุมชน",
        expect: "บันทึกเข้าตาราง community_members และนำทางเข้าสู่หน้ากลุ่มทันที"
      }
    ]
  ));



  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.38 กรณีทดสอบ: หน้ารายละเอียดชุมชน - ฟีดกระดานโพสต์ภายในกลุ่ม (Community Detail - Feed Tab)",
    "เข้าสู่หน้ารายละเอียดชุมชน\n(/community/:slug)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงฟีดโพสต์เฉพาะภายในกลุ่มชุมชน",
        step: "1. เปิดแท็บ \"ฟีดโพสต์\" ในหน้าชุมชน",
        data: "Slug: nuxt-dev",
        expect: "แสดงเฉพาะโพสต์ที่เผยแพร่ภายในกลุ่มชุมชนนี้"
      },
      {
        title: "สร้างโพสต์ใหม่ภายในกลุ่มชุมชน",
        step: "1. พิมพ์ข้อความในกล่องโพสต์ของกลุ่ม\n2. กดโพสต์",
        data: "ข้อความ: \"ยินดีต้อนรับสู่ชุมชน Nuxt Developer\"",
        expect: "โพสต์แสดงในฟีดของกลุ่มทันที และบันทึกลงฐานข้อมูล posts ผูก community_id"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.39 กรณีทดสอบ: หน้ารายละเอียดชุมชน - เมนูเลือกระดับความเป็นส่วนตัวของการโพสต์ (Post Privacy Selection)",
    "อยู่ที่กล่องสร้างโพสต์ในหน้าชุมชน\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "กำหนดระดับความเป็นส่วนตัวของโพสต์",
        step: "1. คลิกเมนูเลือกระดับความเป็นส่วนตัว\n2. เลือก \"เฉพาะสมาชิกกลุ่ม\"",
        data: "Privacy: community_only",
        expect: "แสดงไอคอนระดับความเป็นส่วนตัวถูกต้อง และจำกัดสิทธิ์ให้เฉพาะสมาชิกในกลุ่มมองเห็น"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.40 กรณีทดสอบ: หน้ารายละเอียดชุมชน - แท็บรวมภาพและสื่อมีเดีย (Community Detail - Media Gallery)",
    "อยู่ที่หน้ารายละเอียดชุมชน\n(/community/:slug)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงแกลเลอรีภาพและสื่อของชุมชน",
        step: "1. คลิกแท็บ \"มีเดีย\" ในหน้ารายละเอียดชุมชน",
        data: "-",
        expect: "แสดงรูปภาพและสื่อทั้งหมดที่โพสต์ภายในกลุ่มในรูปแบบตารางแกลเลอรี"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.41 กรณีทดสอบ: หน้าศูนย์การแจ้งเตือน (Notifications Center)",
    "เรียกใช้งานหน้าการแจ้งเตือน\n(/notifications)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "รับการแจ้งเตือนกิจกรรมแบบเรียลไทม์",
        step: "1. มีผู้ใช้อื่นมากดถูกใจหรือคอมเมนต์\n2. ตรวจสอบหน้าแจ้งเตือน",
        data: "ประเภท: LIKE, COMMENT, FOLLOW",
        expect: "แสดงรายการแจ้งเตือนใหม่ทันที พร้อมไอคอนประเภทกิจกรรมและเวลา"
      },
      {
        title: "คลิกนำทางจากรายการแจ้งเตือน",
        step: "1. คลิกที่รายการแจ้งเตือน",
        data: "Notification ID: 10",
        expect: "นำทางไปยังหน้ารายละเอียดโพสต์นั้นทันที และปรับสถานะเป็นอ่านแล้ว (is_read=1)"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.42 กรณีทดสอบ: หน้าบุ๊กมาร์กรายการโพสต์ที่บันทึกไว้ (Bookmarks Page)",
    "เรียกใช้งานหน้าบุ๊กมาร์ก\n(/bookmarks)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงรายการโพสต์ที่บันทึกไว้",
        step: "1. บันทึกโพสต์จากหน้าฟีด\n2. เปิดหน้ารายการบุ๊กมาร์ก",
        data: "User ID: 1",
        expect: "แสดงรายการโพสต์ทั้งหมดที่เคยบันทึกไว้เรียงตามลำดับเวลาล่าสุด"
      },
      {
        title: "ยกเลิกการบันทึกโพสต์ (Remove Bookmark)",
        step: "1. คลิกไอคอนบุ๊กมาร์กบนการ์ดโพสต์เพื่อยกเลิก",
        data: "Post ID: 2",
        expect: "โพสต์ถูกนำออกจากหน้ารายการบุ๊กมาร์กทันที และลบออกจากตาราง bookmarks"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.43 กรณีทดสอบ: หน้าโปรไฟล์ผู้ใช้งาน - แท็บโพสต์ (User Profile - Posts Tab)",
    "เรียกใช้งานหน้าโปรไฟล์ผู้ใช้\n(/profile/:username)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงข้อมูลโปรไฟล์และแท็บโพสต์",
        step: "1. เปิดหน้าโปรไฟล์ผู้ใช้\n2. ตรวจสอบแท็บ \"โพสต์\"",
        data: "Username: @arm",
        expect: "แสดงรูปประจำตัว แบนเนอร์ ชื่อแสดง ประวัติย่อ และโพสต์ทั้งหมดของผู้ใช้"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.44 กรณีทดสอบ: หน้าโปรไฟล์ผู้ใช้งาน - แท็บรีโพสต์ (User Profile - Reposts Tab)",
    "อยู่ที่หน้าโปรไฟล์ผู้ใช้\n(/profile/:username)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงรายการโพสต์ที่เคยรีโพสต์",
        step: "1. คลิกเลือกแท็บ \"รีโพสต์\"",
        data: "-",
        expect: "แสดงรายการโพสต์ที่ผู้ใช้นี้เคยกดรีโพสต์พร้อมป้ายกำกับ Reposted"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.45 กรณีทดสอบ: หน้าโปรไฟล์ผู้ใช้งาน - แท็บมีเดีย (User Profile - Media Tab)",
    "อยู่ที่หน้าโปรไฟล์ผู้ใช้\n(/profile/:username)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงรูปภาพและสื่อทั้งหมดของผู้ใช้",
        step: "1. คลิกเลือกแท็บ \"มีเดีย\"",
        data: "-",
        expect: "แสดงแกลเลอรีรูปภาพและสื่อทั้งหมดที่ผู้ใช้เคยแนบในโพสต์"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.46 กรณีทดสอบ: หน้าโปรไฟล์ผู้ใช้งาน - แท็บถูกใจ (User Profile - Likes Tab)",
    "อยู่ที่หน้าโปรไฟล์ผู้ใช้\n(/profile/:username)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แสดงรายการโพสต์ที่เคยกดถูกใจ",
        step: "1. คลิกเลือกแท็บ \"ถูกใจ\"",
        data: "-",
        expect: "แสดงรายการโพสต์ทั้งหมดที่ผู้ใช้นี้เคยกด Like"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.47 กรณีทดสอบ: หน้าต่าง Modal รายชื่อผู้ที่เรากำลังติดตาม (Following List Modal)",
    "อยู่ที่หน้าโปรไฟล์ผู้ใช้\n(/profile/:username)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เปิดดูรายชื่อผู้ที่เรากำลังติดตาม",
        step: "1. คลิกที่ตัวเลข \"กำลังติดตาม\"",
        data: "Following Count: 12",
        expect: "แสดงหน้าต่าง Modal รายชื่อผู้ที่เรากำลังติดตาม พร้อมปุ่ม \"เลิกติดตาม\""
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.48 กรณีทดสอบ: หน้าต่าง Modal รายชื่อผู้ติดตาม (Followers List Modal)",
    "อยู่ที่หน้าโปรไฟล์ผู้ใช้\n(/profile/:username)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เปิดดูรายชื่อผู้ที่ติดตามเรา",
        step: "1. คลิกที่ตัวเลข \"ผู้ติดตาม\"",
        data: "Followers Count: 25",
        expect: "แสดงหน้าต่าง Modal รายชื่อผู้ที่ติดตามเรา พร้อมปุ่ม \"ติดตามกลับ\""
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.49 กรณีทดสอบ: หน้าต่าง Modal แก้ไขข้อมูลโปรไฟล์ (Edit Profile Modal)",
    "คลิกปุ่มแก้ไขโปรไฟล์บนหน้าโปรไฟล์\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แก้ไขข้อมูลโปรไฟล์สำเร็จ",
        step: "1. แก้ไขชื่อแสดง ประวัติย่อ และอัปโหลดรูปภาพ\n2. กดบันทึก",
        data: "ชื่อแสดง: \"Panupong Dev\", Bio: \"Full-stack Developer\"",
        expect: "บันทึกลงฐานข้อมูล users และอัปเดตข้อมูลบนหน้าโปรไฟล์ทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.50 กรณีทดสอบ: หน้าต่าง Modal การตั้งค่าบัญชีและการแสดงผล (Settings Modal)",
    "เปิดเมนูการตั้งค่าระบบ\n(/settings)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "สลับโหมดธีม Dark / Light Mode",
        step: "1. คลิกสลับโหมดธีมมืด/สว่าง",
        data: "Theme: dark / light",
        expect: "ธีมสีของหน้าต่างเว็บทั้งหมดเปลี่ยนตามที่เลือก และบันทึกค่าลง LocalStorage"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.51 กรณีทดสอบ: หน้าการตั้งค่าความปลอดภัยของบัญชี (Account Security Settings)",
    "เรียกใช้งานหน้าตั้งค่าความปลอดภัย\n(/settings/security)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "ตรวจสอบเมนูความปลอดภัยของบัญชี",
        step: "1. เรียกดูหน้าตั้งค่าความปลอดภัย",
        data: "-",
        expect: "แสดงเมนูจัดการเปลี่ยนรหัสผ่าน จัดการอีเมล และเปลี่ยนชื่อผู้ใช้งาน"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.52 กรณีทดสอบ: หน้าต่าง Modal เปลี่ยนรหัสผ่านบัญชี (Change Password Modal)",
    "เปิดหน้าต่างเปลี่ยนรหัสผ่าน\n(/settings/security)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เปลี่ยนรหัสผ่านบัญชีสำเร็จ",
        step: "1. กรอกรหัสเดิม รหัสใหม่ และยืนยันรหัสใหม่\n2. กดบันทึก",
        data: "รหัสเดิม: 12345678A, รหัสใหม่: NewPass@2026",
        expect: "บันทึกรหัสผ่านใหม่ที่เข้ารหัส Bcrypt ลงฐานข้อมูล users และแสดงแจ้งเตือนสำเร็จ"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.53 กรณีทดสอบ: หน้าต่าง Modal จัดการอีเมลของบัญชี (Manage Email Modal)",
    "เปิดหน้าต่างจัดการอีเมล\n(/settings/security)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "จัดการและแก้ไขอีเมลของบัญชี",
        step: "1. แก้ไขอีเมลใหม่\n2. กดบันทึก",
        data: "อีเมลใหม่: arm_dev@gmail.com",
        expect: "อัปเดตอีเมลลงตาราง users สำเร็จ พร้อมส่งข้อความแจ้งเตือน"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.54 กรณีทดสอบ: หน้าต่าง Modal เปลี่ยนชื่อผู้ใช้งาน (Change Username Modal)",
    "เปิดหน้าต่างเปลี่ยนชื่อผู้ใช้\n(/settings/security)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "เปลี่ยนชื่อผู้ใช้งานสำเร็จ",
        step: "1. กรอกชื่อผู้ใช้ใหม่ที่ไม่ซ้ำในระบบ\n2. กดเปลี่ยนชื่อผู้ใช้",
        data: "Username ใหม่: arm_officials",
        expect: "เปลี่ยนชื่อผู้ใช้สำเร็จ และ URL โปรไฟล์เปลี่ยนตามชื่อใหม่ทันที"
      }
    ]
  ));

  sec4Elements.push(...createTestCaseTableLandscape(
    "ตารางที่ 3.55 กรณีทดสอบ: เมนูดำเนินการกับโพสต์ - แก้ไข ลบ และเปลี่ยนความเป็นส่วนตัว (Post Action Menu)",
    "อยู่ที่หน้าฟีดหรือหน้าโพสต์\n(/)\nระบบเครือข่ายสังคมออนไลน์ ConnecXus",
    [
      {
        title: "แก้ไขเนื้อหาโพสต์ (Edit Post)",
        step: "1. คลิกเมนู 3 จุดบนโพสต์ตนเอง\n2. เลือก \"แก้ไขโพสต์\"\n3. แก้ไขข้อความและกดบันทึก",
        data: "ข้อความใหม่: \"ข้อความที่ได้รับการแก้ไขแล้ว\"",
        expect: "เนื้อหาโพสต์อัปเดตทันที พร้อมแสดงป้ายกำกับ \"(แก้ไขแล้ว)\""
      },
      {
        title: "ลบโพสต์ (Delete Post)",
        step: "1. คลิกเมนู 3 จุดบนโพสต์ตนเอง\n2. เลือก \"ลบโพสต์\"\n3. กดยืนยันการลบ",
        data: "Post ID: 1",
        expect: "โพสต์ถูกลบออกจากหน้าฟีดทันที และปรับสถานะ is_deleted=1 ในฐานข้อมูล"
      }
    ]
  ));

  // ==========================================
  // SECTION 5: Portrait (3.6 & 3.7)
  // ==========================================
  const sec5Elements = [];

  // Section 3.6
  sec5Elements.push(createHeading2("3.6 ศึกษาวิเคราะห์และการเก็บรวบรวมข้อมูล"));
  
  sec5Elements.push(createHeading3("3.6.1 การเตรียมการทดสอบระบบ"));
  sec5Elements.push(createPara("ผู้จัดทำได้เตรียมระบบเครือข่ายสังคมออนไลน์ ConnecXus สำหรับการทดสอบการทำงานของระบบตามกรณีทดสอบ (Test Case) ในวันที่ 27 สิงหาคม 2569 โดยจัดเตรียมข้อมูลที่จำเป็นสำหรับการทดสอบ ได้แก่ ข้อมูลบัญชีผู้ใช้งานในแต่ละสิทธิ์ (ผู้ดูแลระบบ, สมาชิก, บุคคลทั่วไป) ข้อมูลโปรไฟล์ ข้อมูลโพสต์และสื่อมีเดีย ข้อมูลกลุ่มชุมชน ข้อมูลการสนทนาแชทเรียลไทม์ ตลอดจนข้อมูลการรายงานปัญหา เพื่อให้ระบบมีข้อมูลพื้นฐานที่ครบถ้วนและเพียงพอสำหรับการทดลองใช้งานจริง ตลอดจนสามารถตรวจสอบความถูกต้องของการประมวลผลในแต่ละฟังก์ชันได้อย่างแม่นยำ"));

  sec5Elements.push(createHeading3("3.6.2 การดำเนินการทดสอบระบบ"));
  sec5Elements.push(createPara("ผู้จัดทำได้ดำเนินการทดสอบระบบตามกรณีทดสอบ (Test Case) ในวันที่ 27 สิงหาคม 2569 โดยแบ่งการทดสอบตามกลุ่มผู้ใช้งานออกเป็น 2 ส่วนหลัก โดยเริ่มจากกลุ่มผู้ดูแลระบบ ดังนี้:"));
  sec5Elements.push(createPara("1. กลุ่มผู้ดูแลระบบ (Admin Moderation & System Administration) จำนวน 5 คน ทดสอบตามกรณีทดสอบตารางที่ 3.1 ถึง 3.13 ได้แก่ การเข้าสู่ระบบแอดมิน การตรวจสอบแดชบอร์ดสถิติภาพรวม การจัดการบัญชีผู้ใช้และระงับบัญชี (Ban Vault) การจัดการกลุ่มชุมชนส่วนกลาง การตรวจสอบและยุติรายงานปัญหา ตลอดจนการตรวจสอบบันทึกกิจกรรมระบบ (System Logs)", { indent: { left: 400 } }));
  sec5Elements.push(createPara("2. กลุ่มผู้ใช้งานทั่วไปและสมาชิก (General Users & Community Members) จำนวน 25 คน ทดสอบตามกรณีทดสอบตารางที่ 3.14 ถึง 3.55 ได้แก่ การสมัครสมาชิกและการเข้าสู่ระบบ (ทั้งแบบฟอร์มปกติและ QR Code) การเรียกดูและสร้างโพสต์บนฟีดข่าวสาร การมีปฏิสัมพันธ์ (ถูกใจ รีโพสต์ บุ๊กมาร์ก คอมเมนต์) การสำรวจเทรนด์ฮิต การส่งข้อความแชทส่วนตัวและกลุ่มแบบเรียลไทม์ (ข้อความเสียง สติกเกอร์ GIF อิโมจิ ปรับแต่งธีม) การสร้างและจัดการกลุ่มชุมชน การตั้งค่าโปรไฟล์ และการจัดการความปลอดภัยของบัญชี", { indent: { left: 400 } }));


  sec5Elements.push(createHeading3("3.6.3 การเก็บรวบรวมข้อมูลจากแบบประเมินหลังจากดำเนินการทดสอบระบบ"));
  sec5Elements.push(createPara("ผู้จัดทำได้ให้ผู้ใช้งานกลุ่มเป้าหมายจำนวน 30 คน ทดลองใช้งานระบบและทำแบบประเมินความพึงพอใจในวันที่ 27 สิงหาคม 2569 เพื่อรวบรวมความคิดเห็นและข้อเสนอแนะที่มีต่อระบบ โดยแบบประเมินประกอบด้วย ด้านประสิทธิภาพการทำงานของระบบ (Functional Performance) ด้านการออกแบบหน้าจอและการจัดวางองค์ประกอบ (UI/UX Design) และด้านความพึงพอใจโดยรวมและประโยชน์ที่ได้รับ (Overall Usability) จากนั้นนำข้อมูลที่ได้มาวิเคราะห์ผลทางสถิติโดยใช้ ค่าความถี่ ร้อยละ ค่าเฉลี่ย (X̄) และส่วนเบี่ยงเบนมาตรฐาน (S.D.) เพื่อสรุประดับความพึงพอใจของผู้ใช้งานในแต่ละด้านต่อไป"));

  // Section 3.7
  sec5Elements.push(createHeading2("3.7 ศึกษาวิเคราะห์ข้อมูลและสถิติที่ใช้"));
  sec5Elements.push(createPara("หลังจากรวบรวมข้อมูลการประเมินความพึงพอใจและตรวจสอบความถูกต้องเรียบร้อยแล้ว จะนำข้อมูลมาแจกแจงวิเคราะห์ด้วยโปรแกรมสถิติสำเร็จรูป โดยมีสถิติที่ใช้ดังนี้:"));
  sec5Elements.push(createPara("3.7.1 ข้อมูลเกี่ยวกับสถานภาพทั่วไป วิเคราะห์โดยหาค่าความถี่ (Frequency) และ ร้อยละ (Percentage)", { indent: { left: 400 } }));
  sec5Elements.push(createPara("3.7.2 ข้อมูลที่เป็นคำตอบของแบบสอบถาม (Rating Scale 5 ระดับ ตามวิธีของ Likert Scale) วิเคราะห์โดยหา ค่าเฉลี่ย (Mean: X̄) และ ค่าเบี่ยงเบนมาตรฐาน (Standard Deviation: S.D.)", { indent: { left: 400 } }));
  sec5Elements.push(createPara("โดยมีเกณฑ์การแปลผลประเมินความพึงพอใจดังนี้:", { indent: { left: 400 } }));
  sec5Elements.push(createPara("ค่าเฉลี่ย 4.50 – 5.00 หมายถึง มีความพึงพอใจอยู่ในระดับ มากที่สุด", { indent: { left: 800 } }));
  sec5Elements.push(createPara("ค่าเฉลี่ย 3.50 – 4.49 หมายถึง มีความพึงพอใจอยู่ในระดับ มาก", { indent: { left: 800 } }));
  sec5Elements.push(createPara("ค่าเฉลี่ย 2.50 – 3.49 หมายถึง มีความพึงพอใจอยู่ในระดับ ปานกลาง", { indent: { left: 800 } }));
  sec5Elements.push(createPara("ค่าเฉลี่ย 1.50 – 2.49 หมายถึง มีความพึงพอใจอยู่ในระดับ น้อย", { indent: { left: 800 } }));
  sec5Elements.push(createPara("ค่าเฉลี่ย 1.00 – 1.49 หมายถึง มีความพึงพอใจอยู่ในระดับ น้อยที่สุด", { indent: { left: 800 } }));

  // Build 5-Section Document
  const doc = new Document({
    sections: [
      // Section 1: Portrait (3.1 & 3.2 & 3.3.1 & 3.3.2)
      {
        properties: {
          page: {
            orientation: PageOrientation.PORTRAIT,
            size: {
              width: 11906,
              height: 16838
            },
            margin: {
              top: 2160,
              right: 1440,
              bottom: 1440,
              left: 2160
            }
          }
        },
        children: sec1Elements
      },
      // Section 2: LANDSCAPE (3.3.3 Data Dictionary 17 Tables)
      {
        properties: {
          page: {
            orientation: PageOrientation.LANDSCAPE,
            size: {
              width: 16838,
              height: 11906
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: sec2Elements
      },
      // Section 3: Portrait (3.3.4 Site Maps & 3.4 Screen Designs 54 Images)
      {
        properties: {
          page: {
            orientation: PageOrientation.PORTRAIT,
            size: {
              width: 11906,
              height: 16838
            },
            margin: {
              top: 2160,
              right: 1440,
              bottom: 1440,
              left: 2160
            }
          }
        },
        children: sec3Elements
      },
      // Section 4: LANDSCAPE (3.5 System Testing / 54 Test Case Tables)
      {
        properties: {
          page: {
            orientation: PageOrientation.LANDSCAPE,
            size: {
              width: 16838,
              height: 11906
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: sec4Elements
      },
      // Section 5: Portrait (3.6 & 3.7)
      {
        properties: {
          page: {
            orientation: PageOrientation.PORTRAIT,
            size: {
              width: 11906,
              height: 16838
            },
            margin: {
              top: 2160,
              right: 1440,
              bottom: 1440,
              left: 2160
            }
          }
        },
        children: sec5Elements
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = 'd:/ConnecXus/wordadmin/Word/บทที่ 3.docx';
  try {
    fs.writeFileSync(outPath, buffer);
    console.log(`Document regenerated successfully! Path: ${outPath} (Size: ${buffer.length} bytes)`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const fallbackPath = 'd:/ConnecXus/wordadmin/Word/บทที่ 3_new.docx';
      fs.writeFileSync(fallbackPath, buffer);
      console.log(`Note: '${outPath}' was locked by an open application. Saved as fallback: ${fallbackPath} (Size: ${buffer.length} bytes)`);
    } else {
      throw err;
    }
  }
}

buildDoc().catch(err => console.error('Build Error:', err));

