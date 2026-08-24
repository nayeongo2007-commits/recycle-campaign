'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

const ADMIN_PASSWORD = 'recycle2024'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [dormitories, setDormitories] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [form, setForm] = useState({
    dormitory_id: '',
    category: '스킨케어',
    quantity: '',
    collected_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (authed) {
      supabase.from('universities').select('*').then(({ data }) => {
        setUniversities(data || [])
      })
      supabase.from('dormitories2').select('*, universities(name)').then(({ data }) => {
        setDormitories(data || [])
        if (data && data.length > 0) setForm(f => ({ ...f, dormitory_id: data[0].id }))
      })
    }
  }, [authed])

  function handleLogin() {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  async function handleSubmit() {
    if (!form.dormitory_id || !form.quantity) return
    setLoading(true)
    await supabase.from('collections2').insert({
      dormitory_id: Number(form.dormitory_id),
      category: form.category,
      quantity: Number(form.quantity),
      collected_date: form.collected_date
    })
    setLoading(false)
    setSuccess(true)
    setForm(f => ({ ...f, quantity: '' }))
    setTimeout(() => setSuccess(false), 3000)
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border p-8 w-full max-w-sm">
          <h1 className="text-base font-medium text-gray-900 mb-1">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mb-6">비밀번호를 입력해 주세요</p>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 mb-3"
            placeholder="비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {pwError && <p className="text-red-500 text-sm mb-3">비밀번호가 틀렸습니다</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700"
          >
            로그인
          </button>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">대시보드로</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium text-gray-900">관리자 페이지</h1>
          <p className="text-sm text-gray-500">수거량 입력</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">대시보드로</Link>
          <button onClick={() => setAuthed(false)} className="text-sm text-red-500 hover:text-red-700">로그아웃</button>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-base font-medium text-gray-900 mb-6">수거량 입력</h2>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">대학교 및 기숙사</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
              value={form.dormitory_id}
              onChange={e => setForm(f => ({ ...f, dormitory_id: e.target.value }))}
            >
              {universities.map(univ => (
                <optgroup key={univ.id} label={univ.name}>
                  {dormitories.filter(d => d.university_id === univ.id).map(dorm => (
                    <option key={dorm.id} value={dorm.id}>{dorm.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">품목</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {['스킨케어', '샴푸/린스', '바디워시', '헤어케어'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">수량</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
              placeholder="수거된 공병 수를 입력하세요"
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">수거 날짜</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
              value={form.collected_date}
              onChange={e => setForm(f => ({ ...f, collected_date: e.target.value }))}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>

          {success && (
            <p className="text-center text-green-600 text-sm mt-3">저장되었습니다!</p>
          )}
        </div>
      </div>
    </main>
  )
}