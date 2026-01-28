# แบบสำรวจการประเมินสรุปข่าว (News Summary Survey)

เว็บแอปพลิเคชันสำหรับประเมินคุณภาพการสรุปข่าวจาก AI โมเดลต่างๆ โดยมี 2 รูปแบบการประเมิน:
1. **โหมดเปรียบเทียบ** - เลือกสรุปที่ดีที่สุดจาก 4 โมเดล
2. **โหมดให้คะแนน** - ให้คะแนนแต่ละโมเดลใน 4 หัวข้อ

## 🚀 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📁 โครงสร้างโปรเจกต์

```
survey-app/
├── app/
│   ├── page.tsx                 # หน้าแรก - เลือกจำนวนข่าวและโหมด
│   ├── compare/
│   │   └── page.tsx            # โหมดเปรียบเทียบโมเดล
│   ├── rate/
│   │   └── page.tsx            # โหมดให้คะแนนโมเดล
│   ├── thank-you/
│   │   └── page.tsx            # หน้าขอบคุณ
│   ├── layout.tsx              # Layout หลัก
│   └── globals.css             # Global styles + custom classes
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── VideoEmbed.tsx          # YouTube video embed
│   ├── ProgressIndicator.tsx   # แสดง progress
│   └── StarRating.tsx          # Star rating component (1-5 stars)
│
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── data.ts                 # Data loading & utility functions
│   ├── store.ts                # Zustand state management
│   ├── supabase.ts             # Supabase client & DB functions
│   └── utils.ts                # Utility functions
│
├── public/
│   └── all_sum.json            # ข้อมูลข่าวและสรุปจากทุกโมเดล
│
├── supabase-schema.sql         # Database schema
├── .env.example                # Environment variables example
└── README.md                   # คุณอยู่ที่นี่!
```

## 📊 โครงสร้างข้อมูล

### ไฟล์ all_sum.json
```json
{
  "news_data": {
    "social": {
      "social_01": {
        "url": "https://youtube.com/...",
        "summaries": {
          "gpt": "สรุป...",
          "pathumma": "สรุป...",
          "qwen": "สรุป...",
          "typhoon": "สรุป..."
        }
      }
    },
    "economy": { ... },
    "technology": { ... }
  }
}
```

### Database Tables

#### 1. `survey_responses`
เก็บข้อมูลภาพรวมของแต่ละครั้งที่ทำแบบสำรวจ

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Session ID (unique) |
| mode | TEXT | 'compare' หรือ 'rate' |
| news_count | INTEGER | จำนวนข่าว (3, 6, 9, 12, 15) |
| created_at | TIMESTAMPTZ | เวลาที่สร้าง |

#### 2. `compare_answers`
เก็บคำตอบจากโหมดเปรียบเทียบ

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key → survey_responses |
| news_category | TEXT | 'social', 'economy', 'technology' |
| news_id | TEXT | เช่น 'social_01' |
| selected_model | TEXT | โมเดลที่ถูกเลือก |
| created_at | TIMESTAMPTZ | เวลาที่สร้าง |

#### 3. `rating_answers`
เก็บคำตอบจากโหมดให้คะแนน

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key → survey_responses |
| news_category | TEXT | 'social', 'economy', 'technology' |
| news_id | TEXT | เช่น 'social_01' |
| model_name | TEXT | ชื่อโมเดล |
| accuracy_score | INTEGER | คะแนนความแม่นยำ (1-5) |
| completeness_score | INTEGER | คะแนนความครบถ้วน (1-5) |
| conciseness_score | INTEGER | คะแนนความกระชับ (1-5) |
| readability_score | INTEGER | คะแนนความอ่านง่าย (1-5) |
| created_at | TIMESTAMPTZ | เวลาที่สร้าง |

## 🛠️ การติดตั้ง

### 1. Clone โปรเจกต์
```bash
cd survey-app
npm install
```

### 2. ตั้งค่า Supabase

#### 2.1 สร้าง Supabase Project
1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้างบัญชีใหม่ (ฟรี)
3. Create New Project
   - ตั้งชื่อโปรเจกต์
   - สร้างรหัสผ่าน database
   - เลือก region ใกล้ที่สุด (Singapore แนะนำสำหรับไทย)
4. รอประมาณ 2 นาทีให้ database เสร็จ

#### 2.2 รัน SQL Schema
1. ใน Supabase Dashboard ไปที่ **SQL Editor**
2. คลิก **New query**
3. คัดลอกเนื้อหาทั้งหมดจากไฟล์ `supabase-schema.sql`
4. วางใน SQL Editor
5. คลิก **Run** (หรือ Ctrl/Cmd + Enter)
6. ตรวจสอบว่าทั้ง 3 ตารางถูกสร้างโดยไปที่ **Table Editor**

#### 2.3 รับ API Keys
1. ไปที่ **Settings** → **API**
2. คัดลอก:
   - **Project URL** (เช่น `https://xxxxx.supabase.co`)
   - **anon public** key (ตัวยาวมาก)

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:
```bash
cp .env.example .env.local
```

แก้ไข `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. รันโปรเจกต์

```bash
npm run dev
```

เปิดบราวเซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy ไปยัง Vercel

### 1. Push โค้ดขึ้น GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/survey-app.git
git push -u origin main
```

### 2. Deploy บน Vercel
1. ไปที่ [https://vercel.com](https://vercel.com)
2. เข้าสู่ระบบด้วย GitHub
3. คลิก **Add New** → **Project**
4. เลือก repository `survey-app`
5. คลิก **Import**

### 3. ตั้งค่า Environment Variables
ใน Vercel:
1. ไปที่ **Settings** → **Environment Variables**
2. เพิ่ม:
   - `NEXT_PUBLIC_SUPABASE_URL` = `your-url`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-key`
3. คลิก **Deploy**

รอ 2-3 นาที → เว็บพร้อมใช้งาน! 🎉

## 🎨 Design System

### สีหลัก
- **พื้นหลัง**: `#FEFEFE` (ขาวนวล)
- **ตัวอักษร**: `#1D1D1D` (ดำที่ไม่ดำสนิท)
- **Primary (Highlight)**: `#22C55E` (เขียว)

### Custom CSS Classes
สร้างไว้ใน `app/globals.css`:
- `.body-text` - ตัวอักษรทั่วไป
- `.heading-primary` - หัวข้อหลัก
- `.heading-secondary` - หัวข้อรอง
- `.heading-tertiary` - หัวข้อย่อย
- `.card-container` - Card container
- `.btn-primary` - ปุ่มหลัก
- `.btn-secondary` - ปุ่มรอง

## 📱 Features

### หน้าแรก (/)
- เลือกจำนวนข่าว: 3, 6, 9, 12, 15 ข่าว
- เลือกโหมด: เปรียบเทียบ หรือ ให้คะแนน
- ข่าวมาจาก 3 หมวด: สังคม, เศรษฐกิจ, เทคโนโลยี

### โหมดเปรียบเทียบ (/compare)
- แสดงวิดีโอ YouTube
- แสดงสรุปจาก 4 โมเดล (สุ่มลำดับ, ไม่บอกชื่อ)
- เลือก 1 สรุปที่ดีที่สุด
- บังคับเลือกก่อนไปข่าวถัดไป
- แสดง progress: "ข่าวที่ X จาก Y"

### โหมดให้คะแนน (/rate)
- แสดงวิดีโอ YouTube
- แสดงสรุปพร้อมชื่อโมเดล
- ให้คะแนนดาว 1-5 ทุกโมเดลใน 4 หัวข้อ:
  - ความแม่นยำ (Accuracy)
  - ความครบถ้วน (Completeness)
  - ความกระชับ (Conciseness)
  - ความอ่านง่าย (Readability)
- Hover effect บนดาว
- บังคับให้คะแนนครบก่อนไปข่าวถัดไป

### หน้าขอบคุณ (/thank-you)
- แสดงข้อความขอบคุณ
- ปุ่มกลับหน้าแรก (รีเซ็ตข้อมูล)

## 🔧 Zustand Store

State ที่เก็บ:
- `newsCount` - จำนวนข่าวที่เลือก
- `mode` - โหมดที่เลือก ('compare' | 'rate')
- `sessionId` - Session ID (UUID)
- `selectedNews` - ข่าวที่ถูกสุ่มมา
- `currentIndex` - ข่าวข้อปัจจุบัน
- `shuffledModels` - ลำดับโมเดลที่ถูกสุ่มสำหรับแต่ละข่าว
- `compareAnswers` - คำตอบโหมดเปรียบเทียบ
- `ratingAnswers` - คำตอบโหมดให้คะแนน

## 🐛 Debugging

### ตรวจสอบข้อมูลใน Supabase
1. ไปที่ Supabase Dashboard
2. **Table Editor** → เลือกตาราง
3. ดูข้อมูลที่ถูกบันทึก

### ตรวจสอบ State
เปิด Browser Console (F12):
```javascript
// ดู state ทั้งหมด
window.__ZUSTAND__
```

### ปัญหาที่พบบ่อย

**1. วิดีโอ YouTube ไม่แสดง**
- ตรวจสอบ URL format ต้องเป็น `youtube.com/watch?v=...` หรือ `youtu.be/...`

**2. ไม่สามารถบันทึกลง Database**
- ตรวจสอบ environment variables
- ตรวจสอบ Browser Console มี error หรือไม่
- ตรวจสอบ RLS policies ใน Supabase

**3. Build error**
- ลบ `.next` folder: `rm -rf .next`
- ติดตั้ง dependencies ใหม่: `rm -rf node_modules && npm install`
- Build ใหม่: `npm run build`

## 📈 การวิเคราะห์ข้อมูล

Supabase มี Views พร้อมใช้สำหรับวิเคราะห์:

### 1. Model Performance (Compare Mode)
```sql
SELECT * FROM compare_model_stats;
```

### 2. Model Performance (Rating Mode)
```sql
SELECT * FROM rating_model_stats;
```

### 3. Category Performance
```sql
SELECT * FROM category_compare_stats;
```

## 🙏 Credits

สร้างด้วย:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

---

Made with ❤️ for AI News Summary Evaluation
