'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 15000),
        ),
      ]);

      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      const [{ data: staffProfile }, { data: guestAccount }] = await Promise.all([
        supabase.from('user_profiles').select('id').eq('id', result.data.user.id).maybeSingle(),
        supabase.from('guest_accounts').select('id').eq('id', result.data.user.id).maybeSingle(),
      ]);
      toast.success('ยินดีต้อนรับกลับ');

      if (staffProfile) {
        router.push('/dashboard');
      } else if (guestAccount) {
        router.push('/portal/bookings');
      } else {
        router.push('/onboarding');
      }

      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_TIMEOUT') {
        toast.error('การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      } else {
        toast.error('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">เข้าสู่ระบบ</h1>
        <p className="text-sm text-muted-foreground mt-2">
          ยินดีต้อนรับกลับ กรอกข้อมูลด้านล่างเพื่อเข้าใช้งาน
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="อีเมล"
          placeholder="you@hotel.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label="รหัสผ่าน"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full group" disabled={loading} size="lg">
          {loading ? 'กำลังเข้าสู่ระบบ...' : (
            <>
              เข้าสู่ระบบ
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        ยังไม่มีบัญชี?{' '}
        <Link href="/auth/signup" className="text-foreground font-medium hover:underline underline-offset-4">
          สมัครฟรี
        </Link>
      </p>
    </div>
  );
}
