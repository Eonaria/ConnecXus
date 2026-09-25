const fs = require('fs');
const path = require('path');
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  PageOrientation
} = require('d:/ConnecXus/connecxus/node_modules/docx');

const PORTRAIT_PAGE_WIDTH_DXA = 11906;
const MARGIN_DXA = 1440;

const font = "TH Sarabun PSK";
const fontSize = 32; // 16pt
const fontSizeTitle = 36; // 18pt

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

async function buildDoc() {
  const elements = [];

  // Heading Chapter 5
  elements.push(createHeading1("บทที่ 5"));
  elements.push(createHeading1("สรุปผล อภิปรายผล และข้อเสนอแนะ"));
  elements.push(createPara("การดำเนินงานโครงงานสร้างระบบเครือข่ายสังคมออนไลน์ ConnecXus ผู้จัดทำสามารถสรุปผลการดำเนินงาน อภิปรายผล และข้อเสนอแนะได้ดังนี้", { spaceBefore: 140, spaceAfter: 100 }));

  elements.push(createPara("5.1 สรุปผลการดำเนินงาน", { indent: { left: 400 }, spaceBefore: 40, spaceAfter: 40 }));
  elements.push(createPara("5.2 อภิปรายผล", { indent: { left: 400 }, spaceBefore: 40, spaceAfter: 40 }));
  elements.push(createPara("5.3 ข้อเสนอแนะ", { indent: { left: 400 }, spaceBefore: 40, spaceAfter: 140 }));

  // 5.1 สรุปผลการดำเนินงาน
  elements.push(createHeading2("5.1 สรุปผลการดำเนินงาน"));
  elements.push(createPara("การจัดทำโครงงานระบบเครือข่ายสังคมออนไลน์ ConnecXus สามารถสรุปผลการดำเนินงานได้ดังนี้"));

  // 5.1.1 วัตถุประสงค์ของโครงงาน
  elements.push(createHeading3("5.1.1 วัตถุประสงค์ของโครงงาน"));
  elements.push(createPara("5.1.1.1 เพื่อออกแบบและพัฒนาระบบเครือข่ายสังคมออนไลน์ ConnecXus", { indent: { left: 800 } }));
  elements.push(createPara("5.1.1.2 เพื่อทดสอบประสิทธิภาพการทำงานของระบบเครือข่ายสังคมออนไลน์ ConnecXus", { indent: { left: 800 } }));
  elements.push(createPara("5.1.1.3 เพื่อศึกษาความพึงพอใจของผู้ใช้งานที่มีต่อระบบเครือข่ายสังคมออนไลน์ ConnecXus", { indent: { left: 800 }, spaceAfter: 100 }));

  // 5.1.2 ขอบเขตของโครงงาน (Admin first, then Member)
  elements.push(createHeading3("5.1.2 ขอบเขตของโครงงาน"));
  elements.push(createPara("5.1.2.1 ส่วนของผู้ดูแลระบบ (Admin & Moderation)", { indent: { left: 800 }, bold: true }));
  elements.push(createPara("1) ระบบเข้าสู่ระบบและยืนยันตัวตนผู้ดูแลระบบ (Admin Authentication & Security)", { indent: { left: 1200 } }));
  elements.push(createPara("2) ระบบแดชบอร์ดแสดงผลสถิติภาพรวมและการวิเคราะห์ข้อมูลระบบ (Admin Analytics Dashboard)", { indent: { left: 1200 } }));
  elements.push(createPara("3) ระบบบริหารจัดการบัญชีผู้ใช้งานและการระงับบัญชี (User Management & Banned Vault)", { indent: { left: 1200 } }));
  elements.push(createPara("4) ระบบบริหารจัดการและกำกับดูแลกลุ่มชุมชนทั้งหมด (Community Central Management)", { indent: { left: 1200 } }));
  elements.push(createPara("5) ระบบตรวจสอบ จัดการ และยุติรายงานปัญหาเนื้อหา (Content Report & Moderation)", { indent: { left: 1200 } }));
  elements.push(createPara("6) ระบบตรวจสอบบันทึกกิจกรรมและประวัติความปลอดภัยของระบบ (System & Security Audit Logs)", { indent: { left: 1200 } }));
  elements.push(createPara("7) ระบบจัดการและดูแลกลุ่มชุมชนของผู้ดูแลกลุ่ม (Community Moderation, Rules & Member Roles)", { indent: { left: 1200 }, spaceAfter: 60 }));

  elements.push(createPara("5.1.2.2 ส่วนของสมาชิกและผู้ใช้งานทั่วไป (Member & General User)", { indent: { left: 800 }, bold: true }));
  elements.push(createPara("1) ระบบลงทะเบียนและเข้าสู่ระบบ (ทั้งแบบฟอร์มปกติและ QR Code Authentication)", { indent: { left: 1200 } }));
  elements.push(createPara("2) ระบบจัดการข้อมูลส่วนตัว โปรไฟล์ รูปภาพหน้าปก และการตั้งค่าความปลอดภัยของบัญชี", { indent: { left: 1200 } }));
  elements.push(createPara("3) ระบบกระดานฟีดข่าวสารหลัก (แท็บสำหรับคุณ และแท็บกำลังติดตาม)", { indent: { left: 1200 } }));
  elements.push(createPara("4) ระบบสร้าง แก้ไข ลบ และจัดการความเป็นส่วนตัวของโพสต์บทความและสื่อมีเดีย", { indent: { left: 1200 } }));
  elements.push(createPara("5) ระบบการมีปฏิสัมพันธ์ทางสังคม (การกดถูกใจ การรีโพสต์ การบันทึกบุ๊กมาร์ก และการแสดงความคิดเห็นย่อย)", { indent: { left: 1200 } }));
  elements.push(createPara("6) ระบบการติดตาม (Follow/Unfollow) และการบล็อกผู้ใช้งาน (Block/Unblock)", { indent: { left: 1200 } }));
  elements.push(createPara("7) ระบบสำรวจเทรนด์ฮิตและบัญชีแนะนำให้ติดตาม (Explore Trends & Suggestions)", { indent: { left: 1200 } }));
  elements.push(createPara("8) ระบบส่งข้อความแชทสดเรียลไทม์ (Direct & Group Chat, ข้อความเสียง, สติกเกอร์, GIF, อิโมจิ, ปรับแต่งธีม)", { indent: { left: 1200 } }));
  elements.push(createPara("9) ระบบสร้างและเข้าร่วมกลุ่มชุมชน (Community Directory, Feed, Media Gallery, Privacy & Invites)", { indent: { left: 1200 } }));
  elements.push(createPara("10) ระบบศูนย์การแจ้งเตือนกิจกรรมแบบเรียลไทม์ (Live Notifications Center)", { indent: { left: 1200 } }));
  elements.push(createPara("11) ระบบรายงานปัญหาโพสต์และผู้ใช้งาน (Report Submission)", { indent: { left: 1200 }, spaceAfter: 100 }));

  // 5.1.3 ผลการทดสอบระบบ
  elements.push(createHeading3("5.1.3 ผลการทดสอบระบบ"));
  elements.push(createPara("ตามแบบกรณีทดสอบระบบเครือข่ายสังคมออนไลน์ ConnecXus พบว่าระบบโดยรวมสามารถทำงานได้ตามข้อกำหนดที่กำหนดไว้ครบถ้วนทุกกรณีทดสอบ (54 หน้าจอ/กรณีทดสอบ) โดยแบ่งเป็นส่วนของผู้ดูแลระบบ 13 กรณีทดสอบ และส่วนของผู้ใช้งานทั่วไป 41 กรณีทดสอบ โดยฟังก์ชันหลักของระบบ เช่น ระบบสมาชิก ระบบกระดานฟีดข่าวสาร ระบบส่งข้อความแชทสดเรียลไทม์ (WebSocket) ระบบกลุ่มชุมชน ระบบความปลอดภัย และระบบแผงควบคุมผู้ดูแลระบบ สามารถทำงานได้อย่างถูกต้อง มีประสิทธิภาพ และช่วยอำนวยความสะดวกแก่ผู้ใช้งานได้อย่างครบวงจร", { indent: { left: 400 }, spaceAfter: 100 }));

  // 5.1.4 ผลการศึกษาความพึงพอใจของผู้ใช้งาน
  elements.push(createHeading3("5.1.4 ผลการศึกษาความพึงพอใจของผู้ใช้งาน"));
  elements.push(createPara("ผลการศึกษาความพึงพอใจของผู้ใช้งานระบบเครือข่ายสังคมออนไลน์ ConnecXus จากกลุ่มตัวอย่างจำนวน 30 คน (ผู้ดูแลระบบ 5 คน และผู้ใช้งานทั่วไป 25 คน) พบว่าโดยภาพรวมอยู่ในระดับ มากที่สุด มีค่าเฉลี่ย X̄ = 4.69, S.D. = 0.458 เมื่อพิจารณาเป็นรายข้อพบว่าผู้ตอบแบบสอบถามมีความพึงพอใจในระดับมากที่สุดทุกรายการ โดยอันดับที่ 1 คือ ความสวยงาม ความทันสมัย และความเป็นเอกลักษณ์ของหน้าตาเว็บไซต์ อยู่ในระดับมากที่สุด มีค่าเฉลี่ย X̄ = 4.87, S.D. = 0.346 รองลงมาคือ ประโยชน์และความคุ้มค่าของระบบในการนำไปประยุกต์ใช้งานด้านการสื่อสารและสร้างคอมมูนิตี้ อยู่ในระดับมากที่สุด มีค่าเฉลี่ย X̄ = 4.80, S.D. = 0.407 และ ความถูกต้องในการจัดการข้อมูลและความปลอดภัยในการเข้าถึงระบบ อยู่ในระดับมากที่สุด มีค่าเฉลี่ย X̄ = 4.77, S.D. = 0.430 ตามลำดับ", { indent: { left: 400 }, spaceAfter: 140 }));

  // 5.2 อภิปรายผล
  elements.push(createHeading2("5.2 อภิปรายผล", { pageBreakBefore: true }));
  elements.push(createPara("การจัดทำโครงงานครั้งนี้มีวัตถุประสงค์เพื่อออกแบบและพัฒนาระบบเครือข่ายสังคมออนไลน์ ConnecXus รวมถึงทดสอบประสิทธิภาพของระบบและศึกษาความพึงพอใจของผู้ใช้งาน สามารถนำผลที่ได้มาอภิปรายผลดังนี้"));

  // 5.2.1 ด้านประสิทธิภาพของระบบ
  elements.push(createHeading3("5.2.1 ด้านประสิทธิภาพของระบบ"));
  elements.push(createPara("ระบบเครือข่ายสังคมออนไลน์ ConnecXus จากการทดสอบประสิทธิภาพโดยใช้แบบกรณีทดสอบ (Test Case) พบว่าระบบสามารถผ่านการทดสอบได้ครบทุกกรณีทดสอบที่กำหนดไว้ (54 รายการ) แสดงให้เห็นว่าระบบมีประสิทธิภาพและสามารถทำงานได้อย่างถูกต้องตามข้อกำหนดและวัตถุประสงค์ที่กำหนดไว้ โดยการพัฒนาระบบได้ดำเนินการตามลำดับขั้นตอนของวงจรการพัฒนาระบบ (System Development Life Cycle: SDLC) ตั้งแต่การวางแผน การวิเคราะห์ระบบ การออกแบบระบบ (DFD และ ERD) การออกแบบส่วนติดต่อผู้ใช้ การพัฒนาระบบด้วยเทคโนโลยีเว็บสมัยใหม่ (Nuxt 4, Vue 3, TailwindCSS, Nitro Engine, MySQL และ WebSocket) การทดสอบระบบ การนำระบบไปทดลองใช้งาน และการบำรุงรักษาระบบ ซึ่งช่วยให้การพัฒนาระบบเป็นไปอย่างเป็นขั้นตอนและมีประสิทธิภาพสูง มีความปลอดภัย และรองรับการทำงานแบบเรียลไทม์ได้อย่างสมบูรณ์", { indent: { left: 400 }, spaceAfter: 100 }));

  // 5.2.2 ด้านความพึงพอใจของผู้ใช้งาน
  elements.push(createHeading3("5.2.2 ด้านความพึงพอใจของผู้ใช้งาน"));
  elements.push(createPara("ผลการศึกษาความพึงพอใจของผู้ใช้งานระบบเครือข่ายสังคมออนไลน์ ConnecXus พบว่าโดยภาพรวมอยู่ในระดับ มากที่สุด มีค่าเฉลี่ย X̄ = 4.69, S.D. = 0.458 โดยผู้ใช้งานมีความพึงพอใจสูงสุดในด้านการออกแบบหน้าจอและความสวยงามทันสมัย (ค่าเฉลี่ย X̄ = 4.87, S.D. = 0.346) และประโยชน์ในการนำไปประยุกต์ใช้งานด้านการติดต่อสื่อสารและสร้างคอมมูนิตี้ (ค่าเฉลี่ย X̄ = 4.80, S.D. = 0.407) แสดงให้เห็นว่าการออกแบบส่วนติดต่อผู้ใช้งาน (UI/UX) และการจัดวางองค์ประกอบของระบบมีความเหมาะสม สวยงาม สบายตา ใช้งานง่าย และรองรับการแสดงผลแบบ Responsive บนอุปกรณ์คอมพิวเตอร์และสมาร์ตโฟนได้อย่างดีเยี่ยม ช่วยให้ผู้ใช้งานสามารถเข้าถึงข้อมูล ฟีดข่าวสาร และการสื่อสารได้อย่างสะดวกและรวดเร็ว", { indent: { left: 400 }, spaceAfter: 140 }));

  // 5.3 ข้อเสนอแนะ
  elements.push(createHeading2("5.3 ข้อเสนอแนะ"));

  // 5.3.1 ข้อเสนอแนะในการนำระบบไปใช้งาน
  elements.push(createHeading3("5.3.1 ข้อเสนอแนะในการนำระบบไปใช้งาน"));
  elements.push(createPara("5.3.1.1 ควรจัดทำคู่มือการใช้งานระบบสำหรับผู้ดูแลระบบและสมาชิก (User & Admin Manual) เพื่อช่วยให้ผู้ใช้งานสามารถทำความเข้าใจฟังก์ชันต่างๆ ของระบบได้อย่างรวดเร็วและถูกต้อง", { indent: { left: 800 } }));
  elements.push(createPara("5.3.1.2 ควรมีการสำรองข้อมูลอัตโนมัติ (Automated Database Backup) ของฐานข้อมูลผู้ใช้งาน โพสต์ และข้อความแชทอย่างสม่ำเสมอ เพื่อป้องกันการสูญหายของข้อมูลสำคัญ", { indent: { left: 800 } }));
  elements.push(createPara("5.3.1.3 ควรมีการตรวจสอบและประเมินประสิทธิภาพของเซิร์ฟเวอร์ (Server Monitoring) และฐานข้อมูลเป็นประจำ เมื่อมีปริมาณผู้ใช้งานและการสื่อสารแบบเรียลไทม์เพิ่มสูงขึ้น", { indent: { left: 800 }, spaceAfter: 100 }));

  // 5.3.2 ข้อเสนอแนะในการพัฒนาโครงงานครั้งต่อไป
  elements.push(createHeading3("5.3.2 ข้อเสนอแนะในการพัฒนาโครงงานครั้งต่อไป"));
  elements.push(createPara("5.3.2.1 ควรพัฒนาต่อยอดให้มีระบบการโทรด้วยเสียงและวิดีโอคอลแบบเรียลไทม์ (Voice & Video Call) ผ่านเทคโนโลยี WebRTC เพื่อเพิ่มช่องทางการสื่อสารที่หลากหลายยิ่งขึ้น", { indent: { left: 800 } }));
  elements.push(createPara("5.3.2.2 ควรพัฒนาระบบในรูปแบบ Mobile Application (iOS / Android) หรือ Progressive Web App (PWA) พร้อมระบบแจ้งเตือนแบบ Push Notifications บนสมาร์ตโฟน เพื่อความสะดวกรวดเร็วในการเข้าถึงข้อมูล", { indent: { left: 800 } }));
  elements.push(createPara("5.3.2.3 ควรพัฒนาระบบถ่ายทอดสด (Live Streaming) และการสร้างกิจกรรมนัดหมาย (Events) ภายในกลุ่มชุมชน เพื่อส่งเสริมการมีส่วนร่วมและกิจกรรมของคอมมูนิตี้ได้อย่างเต็มรูปแบบ", { indent: { left: 800 } }));
  elements.push(createPara("5.3.2.4 ควรนำเทคโนโลยีปัญญาประดิษฐ์ (AI Content Moderation) มาช่วยคัดกรองคำหยาบคาย ตรวจจับภาพและข้อความที่ไม่เหมาะสมแบบอัตโนมัติ เพื่อยกระดับความปลอดภัยและความน่าเชื่อถือของแพลตฟอร์ม", { indent: { left: 800 } }));

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
  const outPath = 'd:/ConnecXus/admin/Word/บทที่ 5.docx';
  try {
    fs.writeFileSync(outPath, buffer);
    console.log(`Document regenerated successfully! Path: ${outPath} (Size: ${buffer.length} bytes)`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const fallbackPath = 'd:/ConnecXus/admin/Word/บทที่ 5_new.docx';
      fs.writeFileSync(fallbackPath, buffer);
      console.log(`Note: '${outPath}' was locked. Saved as fallback: ${fallbackPath} (Size: ${buffer.length} bytes)`);
    } else {
      throw err;
    }
  }
}

buildDoc().catch(err => console.error('Build Error:', err));
