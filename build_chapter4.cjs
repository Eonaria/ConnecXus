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
  PageOrientation
} = require('d:/ConnecXus/connecxus/node_modules/docx');

const PORTRAIT_PAGE_WIDTH_DXA = 11906;
const MARGIN_DXA = 1440;
const PORTRAIT_TABLE_WIDTH_DXA = PORTRAIT_PAGE_WIDTH_DXA - (MARGIN_DXA * 2); // 9026 dxa

const font = "TH Sarabun PSK";
const fontSize = 32; // 16pt (docx uses half-points: 16 * 2 = 32)
const fontSizeTitle = 36; // 18pt
const fontSizeHeader = 28; // 14pt

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
    spacing: { before: options.spaceBefore || 60, after: options.spaceAfter || 60, line: 360 },
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
    spacing: { before: 200, after: 140, line: 360 },
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
    spacing: { before: 180, after: 100, line: 360 },
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
    spacing: { before: 140, after: 80, line: 360 },
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

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "000000" }
};

// 54 Test cases (Admin 13 first, User 41 after)
const testCaseItems = [
  // Admin & Community Moderation (1-13)
  "1. แผงควบคุมผู้ดูแลระบบ - แดชบอร์ดภาพรวมสถิติ (Admin Panel - Dashboard Overview)",
  "2. แผงควบคุมผู้ดูแลระบบ - จัดการบัญชีผู้ใช้งาน (Admin Panel - User Management)",
  "3. แผงควบคุมผู้ดูแลระบบ - ห้องแยกบัญชีที่ถูกระงับ (Admin Panel - Banned Accounts Vault)",
  "4. แผงควบคุมผู้ดูแลระบบ - จัดการกลุ่มชุมชนทั้งหมด (Admin Panel - Community Management)",
  "5. แผงควบคุมผู้ดูแลระบบ - ประวัติและการจัดการรายงานปัญหา (Admin Panel - Reports Management)",
  "6. แผงควบคุมผู้ดูแลระบบ - บันทึกประวัติกิจกรรมระบบ System Logs (Admin Panel - System Logs)",
  "7. หน้าแผงควบคุมชุมชน - ข้อมูลทั่วไปของชุมชน (Community Settings - General Info)",
  "8. หน้าแผงควบคุมชุมชน - กำหนดกฎกติกาของชุมชน (Community Settings - Rules)",
  "9. หน้าแผงควบคุมชุมชน - จัดการความเป็นส่วนตัวและลิงก์เชิญ (Community Settings - Privacy & Invites)",
  "10. หน้าแผงควบคุมชุมชน - จัดการสมาชิกและบทบาท (Community Settings - Members)",
  "11. หน้าแผงควบคุมชุมชน - จัดการคำขอเข้าร่วมชุมชน (Community Settings - Join Requests)",
  "12. หน้าแผงควบคุมชุมชน - จัดการรายงานปัญหาภายในกลุ่ม (Community Settings - Reports)",
  "13. หน้าแผงควบคุมชุมชน - โซนอันตรายและการลบชุมชน (Community Settings - Danger Zone)",
  // User & Member Applications (14-54)
  "14. หน้าจอลงทะเบียนสมัครสมาชิกใหม่ (Register)",
  "15. หน้าจอเข้าสู่ระบบ - เลือกบัญชีผู้ใช้ที่บันทึกไว้ (Login - Saved Accounts)",
  "16. หน้าจอเข้าสู่ระบบ - การกรอกรหัสผ่านบัญชี (Login - Password Input)",
  "17. หน้าจอเข้าสู่ระบบ - สลับหรือเพิ่มบัญชีผู้ใช้งาน (Login - Switch Account)",
  "18. หน้าจอเข้าสู่ระบบด้วย QR Code สแกนผ่านมือถือ (Login with QR Code)",
  "19. หน้าแรกกระดานฟีดข่าวสารหลัก - แท็บสำหรับคุณ (Home Feed - For You)",
  "20. หน้าแรกกระดานฟีดข่าวสารหลัก - แท็บกำลังติดตาม (Home Feed - Following)",
  "21. เมนูดำเนินการกับโพสต์ - แก้ไข ลบ และเปลี่ยนความเป็นส่วนตัว (Post Action Menu)",
  "22. หน้าสำรวจและเทรนด์ฮิต - แท็บมีอะไรเกิดขึ้นบ้าง (Explore & Trends - What's Happening)",
  "23. หน้าสำรวจและเทรนด์ฮิต - แท็บแนะนำให้ติดตาม (Explore & Trends - Who to Follow)",
  "24. หน้าระบบข้อความแชท - รายการกล่องข้อความสนทนา (Messages - Inbox List)",
  "25. หน้าระบบข้อความแชท - ห้องสนทนาส่วนตัว (Direct Message Chat)",
  "26. หน้าระบบข้อความแชท - การเลือกสติกเกอร์และข้อความเสียง (Voice Message & Sticker Picker)",
  "27. หน้าระบบข้อความแชท - เมนูค้นหาและส่งภาพ GIF (GIF Search Picker)",
  "28. หน้าระบบข้อความแชท - แถบเลือกอิโมจิ (Emoji Selector)",
  "29. หน้าระบบข้อความแชท - แถบข้อมูลและการตั้งค่าห้องแชท (Chat Info & Settings Sidebar)",
  "30. หน้าระบบข้อความแชท - เมนูปรับแต่งแชทและธีมสี (Chat Customization Options)",
  "31. หน้าระบบข้อความแชท - ห้องสนทนากลุ่ม (Group Chat Conversation)",
  "32. หน้าระบบข้อความแชท - สมาชิกกลุ่มและการตั้งค่าแชทกลุ่ม (Group Chat Members & Settings)",
  "33. หน้าต่าง Modal เพิ่มสมาชิกเข้ากลุ่มแชท (Add Group Members Modal)",
  "34. หน้าต่าง Modal สร้างกลุ่มแชทใหม่ (Create Group Chat Modal)",
  "35. หน้าระบบข้อความแชท - รายการแชทที่จัดเก็บ (Archived Chats)",
  "36. หน้าศูนย์รวมกลุ่มชุมชนและการค้นหากลุ่ม (Community Directory & Search)",
  "37. หน้าต่าง Modal สร้างกลุ่มชุมชนใหม่ (Create Community Modal)",
  "38. หน้ารายละเอียดชุมชน - ฟีดกระดานโพสต์ภายในกลุ่ม (Community Detail - Feed Tab)",
  "39. หน้ารายละเอียดชุมชน - เมนูเลือกระดับความเป็นส่วนตัวของการโพสต์ (Post Privacy Selection)",
  "40. หน้ารายละเอียดชุมชน - แท็บรวมภาพและสื่อมีเดีย (Community Detail - Media Gallery)",
  "41. หน้าศูนย์การแจ้งเตือน (Notifications Center)",
  "42. หน้าบุ๊กมาร์กรายการโพสต์ที่บันทึกไว้ (Bookmarks Page)",
  "43. หน้าโปรไฟล์ผู้ใช้งาน - แท็บโพสต์ (User Profile - Posts Tab)",
  "44. หน้าโปรไฟล์ผู้ใช้งาน - แท็บรีโพสต์ (User Profile - Reposts Tab)",
  "45. หน้าโปรไฟล์ผู้ใช้งาน - แท็บมีเดีย (User Profile - Media Tab)",
  "46. หน้าโปรไฟล์ผู้ใช้งาน - แท็บถูกใจ (User Profile - Likes Tab)",
  "47. หน้าต่าง Modal รายชื่อผู้ที่เรากำลังติดตาม (Following List Modal)",
  "48. หน้าต่าง Modal รายชื่อผู้ติดตาม (Followers List Modal)",
  "49. หน้าต่าง Modal แก้ไขข้อมูลโปรไฟล์ (Edit Profile Modal)",
  "50. หน้าต่าง Modal การตั้งค่าบัญชีและการแสดงผล (Settings Modal)",
  "51. หน้าการตั้งค่าความปลอดภัยของบัญชี (Account Security Settings)",
  "52. หน้าต่าง Modal เปลี่ยนรหัสผ่านบัญชี (Change Password Modal)",
  "53. หน้าต่าง Modal จัดการอีเมลของบัญชี (Manage Email Modal)",
  "54. หน้าต่าง Modal เปลี่ยนชื่อผู้ใช้งาน (Change Username Modal)"
];

// Helper to build Table 4.1
function buildTable41() {
  const colW = [5626, 900, 900, 1600]; // Total = 9026 DXA
  const rows = [];

  // Header Row 1
  rows.push(new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: colW[0], type: WidthType.DXA },
        rowSpan: 2,
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "กรณีทดสอบระบบ", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[1] + colW[2], type: WidthType.DXA },
        columnSpan: 2,
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "ผลการทดสอบ", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[3], type: WidthType.DXA },
        rowSpan: 2,
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "หมายเหตุ", font: font, size: fontSize, bold: true })]
          })
        ]
      })
    ]
  }));

  // Header Row 2
  rows.push(new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: colW[1], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "ผ่าน", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[2], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "ไม่ผ่าน", font: font, size: fontSize, bold: true })]
          })
        ]
      })
    ]
  }));

  // Data rows
  testCaseItems.forEach((item) => {
    rows.push(new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: colW[0], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: item, font: font, size: fontSize })]
            })
          ]
        }),
        new TableCell({
          width: { size: colW[1], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: "✓", font: "Segoe UI Symbol", size: 28, bold: true })]
            })
          ]
        }),
        new TableCell({
          width: { size: colW[2], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: "", font: font, size: fontSize })]
            })
          ]
        }),
        new TableCell({
          width: { size: colW[3], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: "-", font: font, size: fontSize })]
            })
          ]
        })
      ]
    }));
  });

  return new Table({
    width: { size: PORTRAIT_TABLE_WIDTH_DXA, type: WidthType.DXA },
    borders: tableBorders,
    rows: rows
  });
}

// Helper to build Table 4.2 (Demographics)
function buildTable42() {
  const colW = [4226, 2400, 2400]; // Total = 9026 DXA
  const rows = [];

  const headers = ["กลุ่มผู้ใช้งาน", "จำนวน (คน)", "ร้อยละ"];
  rows.push(new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colW[i], type: WidthType.DXA },
      shading: { fill: "F2F2F2" },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 30, after: 30, line: 280 },
          children: [new TextRun({ text: h, font: font, size: fontSize, bold: true })]
        })
      ]
    }))
  }));

  const data = [
    ["กลุ่มผู้ดูแลระบบและผู้เชี่ยวชาญ (Admin)", "5", "16.67"],
    ["กลุ่มผู้ใช้งานทั่วไปและสมาชิก (User & Member)", "25", "83.33"],
    ["รวม", "30", "100.00"]
  ];

  data.forEach((row, rowIdx) => {
    const isTotal = (rowIdx === data.length - 1);
    rows.push(new TableRow({
      cantSplit: true,
      children: row.map((cellText, i) => new TableCell({
        width: { size: colW[i], type: WidthType.DXA },
        shading: isTotal ? { fill: "F9F9F9" } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: (i === 0) ? (isTotal ? AlignmentType.CENTER : AlignmentType.LEFT) : AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: cellText, font: font, size: fontSize, bold: isTotal })]
          })
        ]
      }))
    }));
  });

  return new Table({
    width: { size: PORTRAIT_TABLE_WIDTH_DXA, type: WidthType.DXA },
    borders: tableBorders,
    rows: rows
  });
}

// Helper to build Table 4.3 (Satisfaction Evaluation)
function buildTable43() {
  const colW = [4626, 1100, 1100, 1100, 1100]; // Total = 9026 DXA
  const rows = [];

  // Header Row 1
  rows.push(new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: colW[0], type: WidthType.DXA },
        rowSpan: 2,
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "รายการประเมิน", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[1] + colW[2] + colW[3] + colW[4], type: WidthType.DXA },
        columnSpan: 4,
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "ระดับความพึงพอใจ", font: font, size: fontSize, bold: true })]
          })
        ]
      })
    ]
  }));

  // Header Row 2
  rows.push(new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: colW[1], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20, line: 280 },
            children: [new TextRun({ text: "X̄", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[2], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20, line: 280 },
            children: [new TextRun({ text: "S.D.", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[3], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20, line: 280 },
            children: [new TextRun({ text: "ลำดับ", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[4], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20, line: 280 },
            children: [new TextRun({ text: "แปลผล", font: font, size: fontSize, bold: true })]
          })
        ]
      })
    ]
  }));

  function addSectionHeader(title) {
    rows.push(new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: PORTRAIT_TABLE_WIDTH_DXA, type: WidthType.DXA },
          columnSpan: 5,
          shading: { fill: "F9F9F9" },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 30, after: 30, line: 280 },
              children: [new TextRun({ text: title, font: font, size: fontSize, bold: true })]
            })
          ]
        })
      ]
    }));
  }

  function addDataRow(itemText, mean, sd, rank, result) {
    rows.push(new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: colW[0], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: itemText, font: font, size: fontSize })]
            })
          ]
        }),
        new TableCell({
          width: { size: colW[1], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: mean, font: font, size: fontSize })]
            })
          ]
        }),
        new TableCell({
          width: { size: colW[2], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: sd, font: font, size: fontSize })]
            })
          ]
        }),
        new TableCell({
          width: { size: colW[3], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: rank, font: font, size: fontSize })]
            })
          ]
        }),
        new TableCell({
          width: { size: colW[4], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20, line: 280 },
              children: [new TextRun({ text: result, font: font, size: fontSize })]
            })
          ]
        })
      ]
    }));
  }

  // Section 1: ด้านประสิทธิภาพการทำงานของระบบ
  addSectionHeader("ด้านประสิทธิภาพการทำงานของระบบ (Functional Performance)");
  addDataRow("1. ความเหมาะสมและถูกต้องของการทำงานในแต่ละฟังก์ชัน (แอดมิน, แชท, โพสต์, ชุมชน)", "4.70", "0.466", "3", "มากที่สุด");
  addDataRow("2. ความรวดเร็วในการตอบสนองและการรับส่งข้อความแบบเรียลไทม์ (Real-time WebSocket)", "4.63", "0.490", "5", "มากที่สุด");
  addDataRow("3. ความถูกต้องในการจัดการข้อมูลและความปลอดภัยในการเข้าถึงระบบ (JWT & Security)", "4.77", "0.430", "2", "มากที่สุด");

  // Section 2: ด้านการออกแบบหน้าจอและการจัดวางองค์ประกอบ
  addSectionHeader("ด้านการออกแบบหน้าจอและการจัดวางองค์ประกอบ (UI/UX Design)");
  addDataRow("4. ความสวยงาม ความทันสมัย และความเป็นเอกลักษณ์ของหน้าตาเว็บไซต์ (Modern UI/UX)", "4.87", "0.346", "1", "มากที่สุด");
  addDataRow("5. การจัดรูปแบบหน้าจอรองรับการใช้งานบนอุปกรณ์ต่างๆ (Responsive Web Design)", "4.60", "0.498", "6", "มากที่สุด");
  addDataRow("6. สีสัน การจัดวางเมนู และการจัดลำดับเนื้อหาในระบบมีความเหมาะสมและสบายตา", "4.67", "0.479", "4", "มากที่สุด");
  addDataRow("7. ขนาดตัวอักษร ไอคอน รูปแบบสื่อ และความชัดเจนขององค์ประกอบหน้าเว็บ", "4.57", "0.504", "7", "มากที่สุด");
  addDataRow("8. ความง่ายและสะดวกในการค้นหาข้อมูล นำทาง และเข้าถึงเมนูต่างๆ", "4.53", "0.507", "8", "มากที่สุด");

  // Section 3: ด้านความพึงพอใจโดยรวมและประโยชน์ที่ได้รับ
  addSectionHeader("ด้านความพึงพอใจโดยรวมและประโยชน์ที่ได้รับ (Overall Satisfaction)");
  addDataRow("9. ความสะดวก รวดเร็ว และความพึงพอใจโดยรวมในการใช้งานระบบเครือข่ายสังคมออนไลน์", "4.73", "0.450", "2", "มากที่สุด");
  addDataRow("10. ประโยชน์และความคุ้มค่าของระบบในการนำไปประยุกต์ใช้งานด้านการสื่อสารและสร้างคอมมูนิตี้", "4.80", "0.407", "1", "มากที่สุด");

  // Summary Row
  rows.push(new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: colW[0], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "เฉลี่ยรวม", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[1], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "4.69", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[2], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "0.458", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[3], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "-", font: font, size: fontSize, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: colW[4], type: WidthType.DXA },
        shading: { fill: "F2F2F2" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 30, line: 280 },
            children: [new TextRun({ text: "มากที่สุด", font: font, size: fontSize, bold: true })]
          })
        ]
      })
    ]
  }));

  return new Table({
    width: { size: PORTRAIT_TABLE_WIDTH_DXA, type: WidthType.DXA },
    borders: tableBorders,
    rows: rows
  });
}

async function buildDoc() {
  const elements = [];

  // Title
  elements.push(createHeading1("บทที่ 4"));
  elements.push(createHeading1("ผลการดำเนินงาน"));
  elements.push(createPara("การดำเนินงานโครงงานสร้างระบบเครือข่ายสังคมออนไลน์ ConnecXus ซึ่งผู้ดำเนินการได้ดำเนินโครงงานเสร็จสิ้นตามวัตถุประสงค์ ดังนี้", { spaceBefore: 140, spaceAfter: 100 }));

  elements.push(createPara("4.1 ผลการทดสอบระบบเครือข่ายสังคมออนไลน์ ConnecXus", { indent: { left: 400 }, spaceBefore: 40, spaceAfter: 40 }));
  elements.push(createPara("4.2 ผลการศึกษาความพึงพอใจของผู้ใช้งานระบบเครือข่ายสังคมออนไลน์ ConnecXus", { indent: { left: 400 }, spaceBefore: 40, spaceAfter: 140 }));

  // 4.1
  elements.push(createHeading2("4.1 ผลการทดสอบระบบเครือข่ายสังคมออนไลน์ ConnecXus"));
  elements.push(createPara("ตารางที่ 4.1 ผลการทดสอบระบบเครือข่ายสังคมออนไลน์ ConnecXus", { bold: true, spaceBefore: 100, spaceAfter: 60, keepWithNext: true }));
  elements.push(buildTable41());
  elements.push(createPara("จากตารางที่ 4.1 ผลการทดสอบระบบเครือข่ายสังคมออนไลน์ ConnecXus พบว่าผลกรณีทดสอบทั้งหมดจำนวน 54 รายการ ผ่านการทดสอบตามเกณฑ์และทำงานได้ถูกต้องสมบูรณ์ครบทุกฟังก์ชัน", { spaceBefore: 140, spaceAfter: 140, pageBreakBefore: false }));

  // 4.2
  elements.push(createHeading2("4.2 ผลการศึกษาความพึงพอใจของผู้ใช้งานระบบเครือข่ายสังคมออนไลน์ ConnecXus", { pageBreakBefore: true }));
  elements.push(createPara("ผู้จัดทำระบบเครือข่ายสังคมออนไลน์ ConnecXus ได้นำระบบที่จัดทำสมบูรณ์แล้วไปให้กลุ่มตัวอย่างทดลองใช้งานเพื่อศึกษาความพึงพอใจของผู้ใช้งาน โดยทำการเก็บรวบรวมข้อมูลจากกลุ่มตัวอย่างจำนวน 30 คน โดยการแจกแบบสอบถามความพึงพอใจในการเข้าใช้งานระบบเครือข่ายสังคมออนไลน์ ConnecXus แล้วนำมาวิเคราะห์ข้อมูลโดยใช้โปรแกรมคอมพิวเตอร์ ซึ่งมีผลการวิเคราะห์ข้อมูล ดังต่อไปนี้"));

  elements.push(createPara("ตอนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม", { indent: { left: 400 }, spaceBefore: 60, spaceAfter: 40 }));
  elements.push(createPara("ตอนที่ 2 ถามเกี่ยวกับความพึงพอใจเกี่ยวกับการพัฒนาระบบเครือข่ายสังคมออนไลน์ ConnecXus ความพึงพอใจเกี่ยวกับการออกแบบระบบ และคุณภาพของระบบ ซึ่งแบ่งออกเป็น 5 ระดับ คือ มากที่สุด มาก ปานกลาง น้อย น้อยที่สุด โดยกำหนดคะแนน 5, 4, 3, 2, และ 1 เป็นการกำหนดการแปลความหมายของคะแนนและค่าเฉลี่ยมีเกณฑ์ดังนี้", { indent: { left: 400 }, spaceBefore: 40, spaceAfter: 40 }));

  elements.push(createPara("ค่าเฉลี่ยระหว่าง 4.50 – 5.00 หมายถึง พึงพอใจมากที่สุด", { indent: { left: 800 }, spaceBefore: 20, spaceAfter: 20 }));
  elements.push(createPara("ค่าเฉลี่ยระหว่าง 3.50 – 4.49 หมายถึง พึงพอใจมาก", { indent: { left: 800 }, spaceBefore: 20, spaceAfter: 20 }));
  elements.push(createPara("ค่าเฉลี่ยระหว่าง 2.50 – 3.49 หมายถึง พึงพอใจปานกลาง", { indent: { left: 800 }, spaceBefore: 20, spaceAfter: 20 }));
  elements.push(createPara("ค่าเฉลี่ยระหว่าง 1.50 – 2.49 หมายถึง พึงพอใจน้อย", { indent: { left: 800 }, spaceBefore: 20, spaceAfter: 20 }));
  elements.push(createPara("ค่าเฉลี่ยระหว่าง 1.00 – 1.49 หมายถึง พึงพอใจน้อยที่สุด", { indent: { left: 800 }, spaceBefore: 20, spaceAfter: 60 }));

  elements.push(createPara("ตอนที่ 3 ถามเกี่ยวกับข้อเสนอแนะอื่นๆ ที่ผู้ตอบแบบสอบถามต้องการแสดงความคิดเห็นเพิ่มเติมเกี่ยวกับระบบเครือข่ายสังคมออนไลน์ ConnecXus", { indent: { left: 400 }, spaceBefore: 40, spaceAfter: 140 }));

  // Part 1
  elements.push(createPara("ตอนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม", { bold: true, spaceBefore: 100, spaceAfter: 40 }));
  elements.push(createPara("ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม ได้นำมาวิเคราะห์ข้อมูลจำนวนร้อยละจะแสดงผลออกมาเป็นตารางได้ดังนี้"));
  elements.push(createPara("ตารางที่ 4.2 ตารางแสดงจำนวนร้อยละของกลุ่มตัวอย่างที่ได้ตอบแบบสอบถาม", { bold: true, spaceBefore: 100, spaceAfter: 60, keepWithNext: true }));
  elements.push(buildTable42());
  elements.push(createPara("จากตารางที่ 4.2 แสดงให้เห็นว่ากลุ่มตัวอย่างที่ได้ตอบแบบสอบถามมีจำนวนทั้งหมด 30 คน แยกเป็น กลุ่มผู้ดูแลระบบ จำนวน 5 คน คิดเป็นร้อยละ 16.67 และกลุ่มผู้ใช้งานทั่วไปและสมาชิก จำนวน 25 คน คิดเป็นร้อยละ 83.33", { spaceBefore: 120, spaceAfter: 140 }));

  // Part 2
  elements.push(createPara("ตอนที่ 2 ความพึงพอใจเกี่ยวกับโครงงานระบบเครือข่ายสังคมออนไลน์ ConnecXus", { bold: true, spaceBefore: 140, spaceAfter: 40, pageBreakBefore: true }));
  elements.push(createPara("ความพึงพอใจของผู้ตอบแบบสอบถามได้นำมาวิเคราะห์ข้อมูลแสดงผลออกมาเป็นตารางได้ดังนี้"));
  elements.push(createPara("ตารางที่ 4.3 แสดงตารางข้อมูลของผู้ตอบแบบสอบถามตามความพึงพอใจเกี่ยวกับโครงงานระบบเครือข่ายสังคมออนไลน์ ConnecXus", { bold: true, spaceBefore: 100, spaceAfter: 60, keepWithNext: true }));
  elements.push(buildTable43());

  // Analysis description
  elements.push(createPara("จากตารางที่ 4.3 แสดงให้เห็นว่ากลุ่มตัวอย่างที่ได้ตอบแบบสอบถามมีความพึงพอใจเกี่ยวกับการใช้งานระบบเครือข่ายสังคมออนไลน์ ConnecXus โดยภาพรวมอยู่ในระดับ มากที่สุด มีค่าเฉลี่ย X̄ = 4.69, S.D. = 0.458 เมื่อพิจารณาเป็นรายข้อพบว่าผู้ตอบแบบสอบถามมีความพึงพอใจในระดับมากที่สุดทุกรายการ โดยอันดับที่ 1 คือ ความสวยงาม ความทันสมัย และความเป็นเอกลักษณ์ของหน้าตาเว็บไซต์ มีค่าเฉลี่ย X̄ = 4.87, S.D. = 0.346 รองลงมาคือ ประโยชน์และความคุ้มค่าของระบบในการนำไปประยุกต์ใช้งานด้านการสื่อสารและสร้างคอมมูนิตี้ มีค่าเฉลี่ย X̄ = 4.80, S.D. = 0.407 และ ความถูกต้องในการจัดการข้อมูลและความปลอดภัยในการเข้าถึงระบบ มีค่าเฉลี่ย X̄ = 4.77, S.D. = 0.430 ตามลำดับ", { spaceBefore: 140, spaceAfter: 140 }));

  // Part 3
  elements.push(createPara("ตอนที่ 3 ข้อเสนอแนะอื่นๆ", { bold: true, spaceBefore: 140, spaceAfter: 40, pageBreakBefore: false }));
  elements.push(createPara("ข้อเสนอแนะเพิ่มเติมจากผู้ตอบแบบสอบถามเกี่ยวกับระบบเครือข่ายสังคมออนไลน์ ConnecXus สรุปได้ดังนี้:"));
  elements.push(createPara("1. ด้านการสื่อสาร: ควรมีการพัฒนาต่อยอดฟังก์ชันการโทรด้วยเสียงและวิดีโอคอล (Voice & Video Calling) แบบตัวต่อตัวและแบบกลุ่ม เพื่อเพิ่มความหลากหลายในการสื่อสารแบบเรียลไทม์ยิ่งขึ้น", { indent: { left: 400 } }));
  elements.push(createPara("2. ด้านแอปพลิเคชัน: ควรพัฒนาต่อยอดในรูปแบบ Progressive Web App (PWA) หรือ Mobile Application (iOS / Android) พร้อมระบบ Push Notifications บนสมาร์ตโฟน เพื่อความสะดวกในการใช้งานขณะอยู่นอกสถานที่", { indent: { left: 400 } }));
  elements.push(createPara("3. ด้านมีเดียและกิจกรรม: ควรเพิ่มฟีเจอร์การถ่ายทอดสด (Live Streaming) และการสร้างกิจกรรมนัดหมาย (Events) ภายในกลุ่มชุมชน เพื่อสนับสนุนกิจกรรมของผู้ใช้งานในคอมมูนิตี้ได้อย่างเต็มรูปแบบ", { indent: { left: 400 } }));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PORTRAIT_PAGE_WIDTH_DXA,
              height: 16838,
              orientation: PageOrientation.PORTRAIT
            },
            margin: {
              top: MARGIN_DXA,
              bottom: MARGIN_DXA,
              left: MARGIN_DXA,
              right: MARGIN_DXA
            }
          }
        },
        children: elements
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = 'd:/ConnecXus/admin/Word/บทที่ 4.docx';
  try {
    fs.writeFileSync(outPath, buffer);
    console.log(`Document regenerated successfully! Path: ${outPath} (Size: ${buffer.length} bytes)`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const fallbackPath = 'd:/ConnecXus/admin/Word/บทที่ 4_new.docx';
      fs.writeFileSync(fallbackPath, buffer);
      console.log(`Note: '${outPath}' was locked. Saved as fallback: ${fallbackPath} (Size: ${buffer.length} bytes)`);
    } else {
      throw err;
    }
  }
}

buildDoc().catch(err => console.error('Build Error:', err));
