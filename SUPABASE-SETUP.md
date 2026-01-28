# 🔧 คู่มือการตั้งค่า Supabase สำหรับ Next.js 15 (2026)

## 📚 ข้อมูลอ้างอิง
- [Use Supabase with Next.js | Supabase Docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [The Easiest Way to Setup Supabase SSR in Next.js 14](https://medium.com/@zeyd.ajraou/the-easiest-way-to-setup-supabase-ssr-in-next-js-14-c590f163773d)

## ⚡ ความเปลี่ยนแปลงสำคัญในปี 2026

### 1. **ใช้ `@supabase/ssr` แทน `@supabase/auth-helpers`**
   - `@supabase/auth-helpers` ถูก deprecated แล้ว
   - ใช้ `@supabase/ssr` สำหรับ Server-Side Rendering
   - รองรับ Next.js 15 App Router อย่างเต็มที่

### 2. **API Key Format ใหม่**
   - Supabase กำลังเปลี่ยนจาก `anon` key เป็น `publishable` key
   - ในช่วงเปลี่ยนผ่าน ยังใช้ `anon` key ได้ปกติ
   - Key ใหม่จะมีรูปแบบ `sb_publishable_xxx`

## 🛠️ ขั้นตอนการติดตั้ง

### ขั้นตอนที่ 1: ติดตั้ง Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**อธิบาย:**
- `@supabase/supabase-js` - Supabase client หลัก
- `@supabase/ssr` - Helper สำหรับ SSR และจัดการ cookies

### ขั้นตอนที่ 2: สร้าง Supabase Project

1. ไปที่ [https://supabase.com](https://supabase.com)
2. คลิก **New Project**
3. กรอกข้อมูล:
   - **Name**: ชื่อโปรเจกต์ (เช่น `survey-app`)
   - **Database Password**: ตั้งรหัสผ่านที่แข็งแรง (เก็บไว้ดีๆ!)
   - **Region**: เลือก `Singapore (Southeast Asia)` สำหรับไทย
   - **Pricing Plan**: เลือก `Free`
4. คลิก **Create new project**
5. รอ 2-3 นาที ให้ database พร้อมใช้งาน

### ขั้นตอนที่ 3: รัน SQL Schema

1. ใน Supabase Dashboard ไปที่ **SQL Editor** (เมนูด้านซ้าย)
2. คลิก **New query**
3. คัดลอกเนื้อหาทั้งหมดจากไฟล์ `supabase-schema.sql`
4. วางใน SQL Editor
5. คลิก **Run** (หรือกด Ctrl+Enter / Cmd+Enter)
6. ตรวจสอบว่าไม่มี error (จะขึ้น "Success" ด้านล่าง)

**ตรวจสอบความสำเร็จ:**
- ไปที่ **Table Editor** (เมนูด้านซ้าย)
- ควรเห็น 3 ตาราง:
  - `survey_responses`
  - `compare_answers`
  - `rating_answers`

### ขั้นตอนที่ 4: รับ API Keys

1. ไปที่ **Settings** → **API** (เมนูด้านซ้าย)
2. คัดลอกข้อมูลต่อไปนี้:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key:** (ตัวยาวมาก ~300+ ตัวอักษร)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### ขั้นตอนที่ 5: ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**สำคัญ:**
- ✅ ใช้ `NEXT_PUBLIC_` prefix เพื่อให้ accessible ใน client
- ✅ ใช้เครื่องหมาย `"` ครอบ value
- ❌ **ห้าม** commit `.env.local` ขึ้น Git
- ✅ เพิ่ม `.env.local` ใน `.gitignore`

### ขั้นตอนที่ 6: โครงสร้างไฟล์ Supabase Client

โปรเจกต์นี้ใช้โครงสร้างแบบ **ถูกต้องตาม Supabase Docs 2026:**

```
lib/
├── supabase/
│   ├── client.ts    # สำหรับ Client Components
│   └── server.ts    # สำหรับ Server Components
└── supabase.ts      # Database functions
```

#### `lib/supabase/client.ts` - Client Side
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**ใช้ตอนไหน:**
- ใน Client Components (`'use client'`)
- เมื่อต้องการเรียก Supabase จาก browser

#### `lib/supabase/server.ts` - Server Side
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}
```

**ใช้ตอนไหน:**
- ใน Server Components (ไม่มี `'use client'`)
- ใน Server Actions
- ใน API Routes

## 🔍 การทดสอบการเชื่อมต่อ

### วิธีที่ 1: ใช้ Browser Console

1. รันโปรเจกต์: `npm run dev`
2. เปิดหน้าแรก: http://localhost:3000
3. เปิด Developer Tools (F12)
4. ไปที่ Console tab
5. พิมพ์:

```javascript
fetch('/api/test-supabase')
```

### วิธีที่ 2: ทดสอบด้วยการส่งแบบสำรวจ

1. เปิดหน้าแรก
2. เลือกจำนวนข่าว (3-15)
3. เลือกโหมด (เปรียบเทียบ หรือ ให้คะแนน)
4. ทำแบบสำรวจให้เสร็จ
5. ไปตรวจสอบใน Supabase Dashboard → **Table Editor**
6. ควรเห็นข้อมูลใหม่ใน `survey_responses` และตารางอื่นๆ

## 🐛 Troubleshooting - แก้ปัญหาที่พบบ่อย

### ❌ Problem 1: "Failed to fetch" หรือ CORS Error

**สาเหตุ:**
- Environment variables ไม่ถูกต้อง
- ไม่มีไฟล์ `.env.local`

**วิธีแก้:**
```bash
# 1. ตรวจสอบว่ามีไฟล์ .env.local หรือไม่
ls -la .env.local

# 2. ตรวจสอบเนื้อหาในไฟล์
cat .env.local

# 3. Restart dev server
# กด Ctrl+C แล้ว
npm run dev
```

### ❌ Problem 2: "row-level security policy violation"

**สาเหตุ:**
- RLS (Row Level Security) เปิดอยู่ แต่ไม่มี policy

**วิธีแก้:**
1. ไปที่ Supabase Dashboard → **Authentication** → **Policies**
2. เลือกตาราง `survey_responses`
3. ตรวจสอบว่ามี policy "Allow anonymous inserts"
4. ถ้าไม่มี ให้รัน SQL schema อีกครั้ง

**หรือ ปิด RLS ชั่วคราว (ไม่แนะนำสำหรับ production):**
```sql
ALTER TABLE survey_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE compare_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE rating_answers DISABLE ROW LEVEL SECURITY;
```

### ❌ Problem 3: "Cannot find module '@supabase/ssr'"

**วิธีแก้:**
```bash
# ติดตั้งใหม่
npm install @supabase/ssr @supabase/supabase-js

# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

### ❌ Problem 4: ข้อมูลไม่ถูกบันทึกลง Database

**ขั้นตอนการตรวจสอบ:**

1. **เปิด Browser Console (F12) ดู Error:**
   - ถ้ามี error สีแดง → คัดลอกมาดู
   - Error message จะบอกว่าปัญหาคืออะไร

2. **ตรวจสอบ Network Tab:**
   - กด F12 → Network tab
   - กรอง "Fetch/XHR"
   - ส่งแบบสำรวจอีกครั้ง
   - ดู request ที่ส่งไป Supabase
   - ถ้าเป็น 401/403 → ปัญหา RLS
   - ถ้าเป็น 400 → ข้อมูลไม่ถูกต้อง

3. **ตรวจสอบ Environment Variables:**
```bash
# ใน terminal
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. **ดู Logs ใน Supabase:**
   - Supabase Dashboard → **Logs** → **Query Performance**
   - จะเห็น queries ที่ fail

## 📊 ดูข้อมูลที่บันทึก

### วิธีที่ 1: Table Editor (UI)

1. Supabase Dashboard → **Table Editor**
2. เลือกตาราง (survey_responses, compare_answers, rating_answers)
3. ดูข้อมูลแบบ visual

### วิธีที่ 2: SQL Editor (Query)

```sql
-- ดูการตอบแบบสำรวจทั้งหมด
SELECT * FROM survey_responses ORDER BY created_at DESC;

-- ดูผลการเลือกโมเดล (Compare Mode)
SELECT * FROM compare_model_stats;

-- ดูคะแนนเฉลี่ย (Rating Mode)
SELECT * FROM rating_model_stats;

-- นับจำนวนคนที่ตอบ
SELECT COUNT(*) as total_responses FROM survey_responses;
```

## 🚀 Deploy บน Vercel

เมื่อ deploy บน Vercel:

1. **ไปที่ Vercel Dashboard** → Settings → Environment Variables
2. **เพิ่ม Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `your-url`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-key`
3. **เลือก Environment:** Production, Preview, Development (ทั้งหมด)
4. **Redeploy** (Deployments → ... → Redeploy)

**สำคัญ:** Vercel ต้องการ environment variables ถูกตั้งค่าก่อน deploy

## 🔐 Security Best Practices

### ✅ ที่ควรทำ:

1. **เปิด RLS (Row Level Security):**
   - ✅ กำหนด policies อย่างชัดเจน
   - ✅ อนุญาตเฉพาะ operations ที่จำเป็น

2. **ใช้ anon key สำหรับ client:**
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe)
   - ❌ **ห้าม** ใช้ `service_role` key บน client

3. **Validate ข้อมูลก่อนบันทึก:**
   - ✅ ตรวจสอบ input จาก user
   - ✅ ใช้ TypeScript types
   - ✅ ใช้ CHECK constraints ใน database

### ❌ ที่ห้ามทำ:

1. ❌ **ห้าม** commit `.env.local` ขึ้น Git
2. ❌ **ห้าม** แชร์ keys ใน public
3. ❌ **ห้าม** ปิด RLS ใน production
4. ❌ **ห้าม** ใช้ `service_role` key ใน client code

## 📱 Production Checklist

ก่อน deploy production ตรวจสอบ:

- [ ] RLS เปิดอยู่ในทุกตาราง
- [ ] Policies ครบถ้วน
- [ ] Environment variables ตั้งค่าใน Vercel
- [ ] ทดสอบการบันทึกข้อมูล
- [ ] ทดสอบบนหลาย browser
- [ ] ทดสอบบน mobile
- [ ] Database backup enabled
- [ ] Rate limiting enabled (optional)

## 📚 เอกสารเพิ่มเติม

- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js 15 Documentation](https://nextjs.org/docs)

---

**คำแนะนำเพิ่มเติม:** ถ้ายังมีปัญหา สามารถดู error ใน:
- Browser Console (F12)
- Terminal ที่รัน `npm run dev`
- Supabase Dashboard → Logs

✨ หวังว่าคู่มือนี้จะช่วยให้คุณตั้งค่า Supabase ได้สำเร็จ!
