'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CellLogPage() {
  const [status, setStatus] = useState('연결 중...')

  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from('cell_logs')
        .select('count')
        .limit(1)
      if (error) {
        setStatus('❌ DB 연결 실패: ' + error.message)
      } else {
        setStatus('✅ Supabase 연결 성공!')
      }
    }
    test()
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#F2F2F7',
      fontFamily: '-apple-system, sans-serif',
      gap: 16
    }}>
      <div style={{ fontSize: 48 }}>🧬</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#1C1C1E' }}>NCTM CellLog</div>
      <div style={{ fontSize: 16, color: '#636366' }}>{status}</div>
    </div>
  )
}