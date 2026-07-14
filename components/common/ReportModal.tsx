'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Loader2, Send, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { translateTerm } = useAppTranslation();

  // 表單欄位狀態
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('數值錯漏');
  const [content, setContent] = useState('');
  const [botCheck, setBotCheck] = useState('');

  // 系統/發送狀態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // 1. 初始化：從 localStorage 讀取暱稱、Email 與冷卻時間
  useEffect(() => {
    if (isOpen) {
      const savedNickname = localStorage.getItem('mortal_reporter_nickname');
      const savedEmail = localStorage.getItem('mortal_reporter_email');
      const lastSubmitTime = localStorage.getItem('mortal_last_report_time');

      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedNickname) setNickname(savedNickname);
      if (savedEmail) setEmail(savedEmail);

      if (lastSubmitTime) {
        const diff = Math.floor((Date.now() - parseInt(lastSubmitTime, 10)) / 1000);
        if (diff < 60) {
          setCooldown(60 - diff);
        }
      }

      setSubmitStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  // 2. 冷卻倒數計時器
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // 3. 表單提交處理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldown > 0) return;
    if (!content.trim()) {
      setErrorMessage(translateTerm('Web.Report.ErrEmptyContent'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      localStorage.setItem('mortal_reporter_nickname', nickname.trim());
      localStorage.setItem('mortal_reporter_email', email.trim());

      const userAgent = window.navigator.userAgent;
      const resolution = `${window.screen.width}x${window.screen.height}`;
      const currentUrl = window.location.pathname + window.location.search;
      const currentTitle = document.title;

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content: content.trim(), nickname: nickname.trim(), email: email.trim(), url: currentUrl, title: currentTitle, userAgent, resolution, bot_check: botCheck })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || translateTerm('Web.Report.ErrSubmitFail'));
      }

      localStorage.setItem('mortal_last_report_time', Date.now().toString());
      setCooldown(60);
      setContent('');
      setSubmitStatus('success');

      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2500);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('回報發送失敗:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || translateTerm('Web.Report.ErrUnknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // SSR 防呆與關閉判斷
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className='fixed inset-0 z-9999 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0'>
      <div className='relative w-full max-w-lg p-6 bg-card border border-border rounded-xl shadow-lg' onClick={(e) => e.stopPropagation()}>
        {/* 標題與說明 */}
        <div className='flex items-center justify-between pb-3 border-b border-border/50'>
          <div className='flex items-center gap-2'>
            <Bug className='size-5 text-primary' />
            <h3 className='text-lg font-bold'>{translateTerm('Web.Report.Title')}</h3>
          </div>
          <button onClick={onClose} className='text-muted-foreground hover:text-foreground p-1 text-sm rounded-md hover:bg-muted cursor-pointer' disabled={isSubmitting}>
            ✕
          </button>
        </div>

        {/* 成功狀態畫面 */}
        {submitStatus === 'success' ? (
          <div className='py-12 text-center space-y-3'>
            <CheckCircle2 className='size-12 text-emerald-500 mx-auto animate-bounce' />
            <h4 className='text-lg font-bold text-foreground'>{translateTerm('Web.Report.SuccessTitle')}</h4>
            <p className='text-sm text-muted-foreground'>{translateTerm('Web.Report.SuccessDesc')}</p>
          </div>
        ) : (
          /* 填寫表單畫面 */
          <form onSubmit={handleSubmit} className='space-y-4 mt-4 text-sm'>
            {/* 蜜罐防禦 (Honeypot) */}
            <div className='absolute left-[-9999px] top-0' aria-hidden='true'>
              <input type='text' name='bot_check' tabIndex={-1} value={botCheck} onChange={(e) => setBotCheck(e.target.value)} autoComplete='off' />
            </div>

            {/* 自動定位提示 */}
            <div className='p-2.5 bg-muted/50 rounded-md border border-border/50 text-xs text-muted-foreground flex items-center justify-between'>
              <span>{translateTerm('Web.Report.CurrentLocation')}</span>
              <span className='font-mono text-foreground font-medium truncate max-w-64' title={typeof window !== 'undefined' ? window.location.pathname : ''}>
                {typeof window !== 'undefined' ? decodeURIComponent(window.location.pathname) : ''}
              </span>
            </div>

            {/* 暱稱與 Email */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <div className='font-medium text-foreground'>{translateTerm('Web.Report.Nickname')}</div>
                <input
                  type='text'
                  name='nickname'
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={translateTerm('Web.Report.NicknamePlaceholder')}
                  maxLength={20}
                  className='w-full px-3 py-1.5 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm'
                />
              </div>
              <div className='space-y-1'>
                <div className='font-medium text-foreground'>
                  {translateTerm('Web.Report.Email')} <span className='text-xs text-muted-foreground'>{translateTerm('Web.Report.Optional')}</span>
                </div>
                <input
                  type='email'
                  name='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={translateTerm('Web.Report.EmailPlaceholder')}
                  maxLength={50}
                  className='w-full px-3 py-1.5 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm'
                  autoComplete='email'
                />
              </div>
            </div>

            {/* 問題類別 */}
            <div className='space-y-1'>
              <div className='font-medium text-foreground'>
                {translateTerm('Web.Report.Category')} <span className='text-destructive'>*</span>
              </div>
              <Select name='category' value={category} onValueChange={setCategory}>
                <SelectTrigger className='w-full h-9'>
                  <SelectValue placeholder={translateTerm('Web.Report.CategoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent position='popper' className='z-10000'>
                  <SelectItem value='數值錯漏'>{translateTerm('Web.Report.Cat.Data')}</SelectItem>
                  <SelectItem value='文本翻譯問題'>{translateTerm('Web.Report.Cat.Text')}</SelectItem>
                  <SelectItem value='功能異常(Bug)'>{translateTerm('Web.Report.Cat.Bug')}</SelectItem>
                  <SelectItem value='建議與其他'>{translateTerm('Web.Report.Cat.Other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 問題描述 */}
            <div className='space-y-1'>
              <div className='font-medium text-foreground'>
                {translateTerm('Web.Report.ContentLabel')} <span className='text-destructive'>*</span>
              </div>
              <textarea
                name='content'
                aria-label={translateTerm('Web.Report.ContentLabel')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={translateTerm('Web.Report.ContentPlaceholder')}
                rows={4}
                maxLength={500}
                required
                className='w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none'
              />
              <div className='text-right text-xs text-muted-foreground'>{content.length}/500</div>
            </div>

            {/* 錯誤提示 */}
            {submitStatus === 'error' && errorMessage && (
              <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-xs flex items-center gap-2'>
                <AlertCircle className='size-4 shrink-0' />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 底部按鈕區 */}
            <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/50'>
              <Button type='button' variant='outline' size='sm' onClick={onClose} disabled={isSubmitting}>
                {translateTerm('Web.Report.Cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isSubmitting || cooldown > 0} className='min-w-24 gap-1.5 cursor-pointer'>
                {isSubmitting ? (
                  <>
                    <Loader2 className='size-3.5 animate-spin' />
                    <span>{translateTerm('Web.Report.Submitting')}</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>
                    {translateTerm('Web.Report.Cooldown')} ({cooldown}s)
                  </span>
                ) : (
                  <>
                    <Send className='size-3.5' />
                    <span>{translateTerm('Web.Report.Submit')}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body // 指定 Portal 掛載目標為 body
  );
}
