'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [universities, setUniversities] = useState<any[]>([])
  const [dormitories, setDormitories] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: univs } = await supabase.from('universities').select('*')
    const { data: dorms } = await supabase.from('dormitories2').select('*, universities(name)')
    const { data: cols } = await supabase.from('collections2').select('*, dormitories2(name, university_id)')
    setUniversities(univs || [])
    setDormitories(dorms || [])
    setCollections(cols || [])
    setLoading(false)
  }

  const totalAll = collections.reduce((sum, c) => sum + c.quantity, 0)
  const categories = ['쿠션/팩트류', '스킨, 로션, 오일, 향수', '수분크림, 아이크림', '클렌징폼, 핸드크림']

  function getUnivTotal(univId: number) {
    const univDorms = dormitories.filter(d => d.university_id === univId).map(d => d.id)
    return collections.filter(c => univDorms.includes(c.dormitory_id)).reduce((sum, c) => sum + c.quantity, 0)
  }

  function getUnivCategoryTotal(univId: number, cat: string) {
    const univDorms = dormitories.filter(d => d.university_id === univId).map(d => d.id)
    return collections.filter(c => univDorms.includes(c.dormitory_id) && c.category === cat).reduce((sum, c) => sum + c.quantity, 0)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium text-gray-900">아모레 리사이클 캠페인</h1>
          <p className="text-sm text-gray-500">중앙대학교 · 건국대학교 공병 수거 현황</p>
        </div>
        <div className="flex gap-4">
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">캠페인 소개</Link>
          <Link href="/admin" className="text-sm text-green-600 hover:text-green-800">관리자</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-gray-500">불러오는 중...</p>
        ) : (
          <>
            <div className="bg-white rounded-xl p-5 border mb-8">
              <p className="text-sm text-gray-500 mb-1">전체 누적 수거량</p>
              <p className="text-3xl font-medium text-gray-900">{totalAll}<span className="text-base font-normal text-gray-500 ml-1">개</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {universities.map(univ => {
                const univDorms = dormitories.filter(d => d.university_id === univ.id)
                const univTotal = getUnivTotal(univ.id)
                const maxCat = Math.max(...categories.map(c => getUnivCategoryTotal(univ.id, c)), 1)
                return (
                  <div key={univ.id} className="bg-white rounded-xl border p-5">
                    <h2 className="text-sm font-medium text-gray-700 mb-1">{univ.name}</h2>
                    <p className="text-3xl font-medium text-gray-900 mb-4">{univTotal}<span className="text-base font-normal text-gray-500 ml-1">개</span></p>

                    <div className="mb-4">
                      {univDorms.map(dorm => {
                        const count = collections.filter(c => c.dormitory_id === dorm.id).reduce((sum, c) => sum + c.quantity, 0)
                        return (
                          <div key={dorm.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                            <span className="text-gray-600">{dorm.name}</span>
                            <span className="font-medium text-gray-900">{count}개</span>
                          </div>
                        )
                      })}
                    </div>

                    <p className="text-xs font-medium text-gray-500 mb-3">품목별 수거 현황</p>
                    {categories.map(cat => {
                      const count = getUnivCategoryTotal(univ.id, cat)
                      return (
                        <div key={cat} className="flex items-center gap-3 mb-2">
                          <span className="text-xs text-gray-600 w-16">{cat}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(count / maxCat) * 100}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-900 w-8 text-right">{count}개</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}