'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/* ══ 타입 ══ */
interface Student { id: string; name: string; color: string }
interface CellLog { id: number; student_id: string; student_name: string; grade: string; level: string; semester: string; major: string; unit: string; book_name: string; section: string; section_label: string; title: string; description: string; question: string; weakness: string; image_urls: string[]; total_count: number; correct_count: number; wrong_count: number; score: number; wrong_summary: string; solved_count: number; created_at: string }

/* ══ 학생 데이터 ══ */
const STU_DATA: Record<string, Record<string, Student[]>> = {
  초등:{
    초1:[{id:'e1a',name:'박서준',color:'#5856D6'},{id:'e1b',name:'김지아',color:'#34C759'}],
    초2:[{id:'e2a',name:'이민서',color:'#FF9500'},{id:'e2b',name:'정수아',color:'#007AFF'}],
    초3:[{id:'e3a',name:'최하준',color:'#FF3B30'},{id:'e3b',name:'윤채원',color:'#5856D6'}],
    초4:[{id:'e4a',name:'강민준',color:'#34C759'},{id:'e4b',name:'오서연',color:'#FF9500'}],
    초5:[{id:'e5a',name:'임지호',color:'#007AFF'}],
    초6:[{id:'e6a',name:'신수빈',color:'#FF3B30'}],
  },
  중등:{
    중1:[{id:'m1a',name:'최수아',color:'#5856D6'},{id:'m1b',name:'한지민',color:'#FF3B30'}],
    중2:[{id:'m2a',name:'류준혁',color:'#007AFF'},{id:'m2b',name:'배수지',color:'#34C759'}],
    중3:[{id:'m3a',name:'고은지',color:'#FF9500'},{id:'m3b',name:'남도현',color:'#5856D6'}],
  },
  고등:{
    고1:[{id:'h1a',name:'박지호',color:'#FF9500'},{id:'h1b',name:'전미래',color:'#007AFF'}],
    고2:[{id:'h2a',name:'김민준',color:'#5856D6'},{id:'h2b',name:'이서연',color:'#34C759'}],
    고3:[{id:'h3a',name:'정태양',color:'#FF3B30'},{id:'h3b',name:'송하은',color:'#FF9500'}],
  },
}
const HIGH_MAP: Record<string,string> = {고1:'공통수학1',고2:'공통수학2',고3:'수학Ⅰ'}
function allStus(): Student[] { const r:Student[]=[]; Object.values(STU_DATA).forEach(g=>Object.values(g).forEach(a=>a.forEach(s=>r.push(s)))); return r }
function getStu(id: string) { return allStus().find(s=>s.id===id) }

const SECTIONS = [
  {k:'concept_study',l:'개념공부',t:'study'},{k:'concept_test',l:'개념테스트',t:'test'},
  {k:'normal_solve',l:'일반유형 풀이',t:'solve'},{k:'normal_wrong',l:'일반유형 오답',t:'study'},{k:'normal_test',l:'일반유형 테스트',t:'test'},
  {k:'advanced_solve',l:'심화유형 풀이',t:'solve'},{k:'advanced_wrong',l:'심화유형 오답',t:'study'},{k:'advanced_test',l:'심화유형 테스트',t:'test'},
  {k:'killer_solve',l:'킬러유형 풀이',t:'solve'},{k:'killer_wrong',l:'킬러유형 오답',t:'study'},{k:'killer_test',l:'킬러유형 테스트',t:'test'},
  {k:'unit_test',l:'단원평가',t:'test'},{k:'unit_wrong',l:'단원오답정리',t:'study'},
]

const CURRICULUM: Record<string, Record<string, string[]>> = {
  "초1_1학기":{"9까지의 수":["1부터 5까지의 수","6부터 9까지의 수","몇째","수의 순서","수의 크기 비교"],"여러가지 모양":["여러 가지 모양 찾기","여러 가지 모양 알아보기","여러 가지 모양 만들기"],"덧셈과 뺄셈":["모으기와 가르기","덧셈","뺄셈","0을 더하거나 빼기"],"비교하기":["길이 비교","무게 비교","넓이 비교"],"50까지의 수":["9 다음 수","11부터 19까지의 수","50까지의 수","수의 순서","두 수의 크기 비교"]},
  "초1_2학기":{"100까지의 수":["몇십","99까지의 수","수의 순서","두 수의 크기 비교","짝수와 홀수"],"덧셈과 뺄셈 (1)":["받아올림이 없는 덧셈","받아내림이 없는 뺄셈"],"덧셈과 뺄셈 (2)":["세 수의 덧셈","세 수의 뺄셈","10이 되는 더하기"],"시계 보기와 규칙 찾기":["시계 보기","규칙 찾기"]},
  "초2_1학기":{"세 자리 수":["백, 몇백","세 자리 수","뛰어서 세기","수의 크기 비교"],"여러 가지 도형":["원","삼각형과 사각형","오각형과 육각형"],"덧셈과 뺄셈":["덧셈","뺄셈","덧셈과 뺄셈"],"분류하기":["분류 기준","기준에 따라 분류하기"],"곱셈":["묶어 세기","몇의 몇 배","곱셈식"]},
  "초2_2학기":{"네 자리 수":["천, 몇천","네 자리 수","뛰어 세기","수의 크기 비교"],"곱셈구구":["곱셈구구 (1)","곱셈구구 (2)"],"길이 재기":["1m 알기","길이의 합","길이의 차"],"시각과 시간":["시각 읽기","시간 알기","달력 알기"],"표와 그래프":["표로 나타내기","그래프로 나타내기"]},
  "초3_1학기":{"덧셈과 뺄셈":["덧셈","뺄셈"],"평면도형":["선의 종류","각","직각삼각형","직사각형","정사각형"],"나눗셈":["나눗셈 식","곱셈과 나눗셈의 관계","나눗셈의 몫"],"곱셈":["(몇십)×(몇)","올림이 없는 곱셈","올림이 있는 곱셈"],"길이와 시간":["mm 단위","km 단위","길이의 계산","시간의 계산"],"분수와 소수":["분수 알아보기","소수 알아보기","소수의 크기 비교"]},
  "초3_2학기":{"곱셈":["(세 자리 수)×(한 자리 수)","(몇십몇)×(몇십몇)"],"나눗셈":["나머지가 없는 나눗셈","나머지가 있는 나눗셈"],"원":["원의 중심, 반지름, 지름","원 그리기"],"분수":["분수로 나타내기","진분수, 가분수","대분수"],"들이와 무게":["들이의 단위","무게의 단위"]},
  "초4_1학기":{"큰 수":["만","억","조","수의 크기 비교"],"각도":["각도 알기","삼각형의 세 각의 합","사각형의 네 각의 합"],"곱셈과 나눗셈":["(세 자리 수)×(두 자리 수)","(세 자리 수)÷(두 자리 수)"],"평면도형의 이동":["밀기","뒤집기","돌리기"],"막대그래프":["막대그래프 읽기","막대그래프 그리기"]},
  "초4_2학기":{"분수의 덧셈과 뺄셈":["진분수의 덧셈","진분수의 뺄셈","대분수의 덧셈","대분수의 뺄셈"],"삼각형":["이등변삼각형","정삼각형","예각삼각형","둔각삼각형"],"소수의 덧셈과 뺄셈":["소수 두 자리 수","소수의 덧셈","소수의 뺄셈"],"사각형":["수직과 수선","평행사변형","마름모"]},
  "초5_1학기":{"자연수의 혼합계산":["덧셈과 뺄셈이 섞인 식","곱셈과 나눗셈이 있는 식","혼합계산"],"약수와 배수":["약수","배수","최대공약수","최소공배수"],"약분과 통분":["크기가 같은 분수","약분","통분","분수의 크기 비교"],"분수의 덧셈과 뺄셈":["분모가 다른 진분수의 덧셈","분모가 다른 대분수의 덧셈","분수의 뺄셈"],"다각형의 둘레와 넓이":["정다각형의 둘레","직사각형의 넓이","삼각형의 넓이","마름모의 넓이"]},
  "초5_2학기":{"수의 범위와 어림하기":["이상과 이하","초과와 미만","올림과 버림","반올림"],"분수의 곱셈":["분수와 자연수의 곱셈","진분수의 곱셈","대분수의 곱셈"],"합동과 대칭":["합동인 도형","선대칭도형","점대칭도형"],"소수의 곱셈":["(소수)×(자연수)","(소수)×(소수)"],"직육면체":["직육면체","정육면체","겨냥도","전개도"]},
  "초6_1학기":{"분수의 나눗셈":["(자연수)÷(자연수)","(분수)÷(자연수)","(대분수)÷(자연수)"],"소수의 나눗셈":["(소수)÷(자연수)","몫의 소수점"],"비와 비율":["비","비율","백분율"],"여러 가지 그래프":["그림그래프","띠그래프","원그래프"],"직육면체의 부피와 겉넓이":["직육면체의 부피","직육면체의 겉넓이"]},
  "초6_2학기":{"분수의 나눗셈":["(분수)÷(분수)","(자연수)÷(분수)"],"소수의 나눗셈":["(소수)÷(소수)","(자연수)÷(소수)"],"비례식과 비례배분":["비의 성질","비례식","비례배분"],"원의 넓이":["원주율","원주","원의 넓이"]},
  "중1_1학기":{"소인수분해":["소수와 합성수","소인수분해","최대공약수","최소공배수"],"정수와 유리수":["양수와 음수","절댓값","유리수의 사칙연산"],"문자와 식":["문자를 사용한 식","일차식","일차방정식"],"좌표평면과 그래프":["순서쌍과 좌표","그래프","정비례","반비례"]},
  "중1_2학기":{"기본 도형":["점, 선, 면","각","평행선의 성질","삼각형의 합동"],"평면도형":["다각형","삼각형의 내각과 외각","원과 부채꼴"],"입체도형":["다면체","회전체","기둥의 겉넓이와 부피","뿔의 겉넓이와 부피"],"통계":["도수분포표","히스토그램","상대도수"]},
  "중2_1학기":{"수와 식":["유리수의 소수 표현","순환소수","지수법칙","다항식의 연산"],"부등식":["부등식","일차부등식"],"방정식":["연립일차방정식","연립방정식의 활용"],"함수":["일차함수","일차함수의 그래프","일차함수의 활용"]},
  "중2_2학기":{"도형의 성질":["이등변삼각형","삼각형의 외심과 내심","평행사변형","여러 가지 사각형"],"도형의 닮음":["닮은 도형","삼각형의 닮음","피타고라스 정리"],"확률":["경우의 수","확률","확률의 계산"]},
  "중3_1학기":{"실수와 그 계산":["제곱근","무리수와 실수","제곱근의 사칙연산"],"다항식의 곱셈과 인수분해":["곱셈공식","인수분해"],"이차방정식":["이차방정식","인수분해를 이용한 풀이","근의 공식","판별식"],"이차함수":["이차함수의 그래프","이차함수의 식"]},
  "중3_2학기":{"삼각비":["삼각비","특수한 각의 삼각비","삼각비의 활용"],"원의 성질":["원의 현","원의 접선","원주각"],"통계":["대푯값","산포도","상관관계"]},
  "공통수학1":{"다항식":["다항식의 연산","곱셈공식","나머지정리","인수분해"],"방정식과 부등식":["복소수","이차방정식","판별식","근과 계수의 관계"],"도형의 방정식":["두 점 사이의 거리","직선의 방정식","원의 방정식","원과 직선"]},
  "공통수학2":{"집합과 명제":["집합","명제","충분조건과 필요조건"],"함수":["함수","합성함수","역함수","유리함수"],"순열과 조합":["경우의 수","순열","조합"]},
  "수학Ⅰ":{"지수함수와 로그함수":["거듭제곱근","지수법칙","로그","지수함수","로그함수"],"삼각함수":["일반각과 호도법","삼각함수","삼각함수의 그래프"]},
}

const BOOKS = {
  elementary:{grades:['초1-1','초1-2','초2-1','초2-2','초3-1','초3-2','초4-1','초4-2','초5-1','초5-2','초6-1','초6-2'],books:[{n:'라이트쎈',p:'신사고'},{n:'쎈',p:'신사고'},{n:'최상위 수학',p:'신사고'},{n:'최상위S',p:'디딤돌'},{n:'최상위 수학',p:'디딤돌'}]},
  middle:{grades:['중1-1','중1-2','중2-1','중2-2','중3-1','중3-2'],books:[{n:'라이트쎈',p:'신사고'},{n:'쎈',p:'신사고'},{n:'일품',p:'좋은책신사고'},{n:'블랙라벨',p:'진학사'},{n:'에이급 수학',p:'에이급'},{n:'고쟁이',p:'이투스'},{n:'수매씽 개념',p:'천재'},{n:'수매씽 유형',p:'천재'},{n:'개념원리',p:'개념원리'},{n:'개념원리 RPM',p:'개념원리'}]},
  high:{grades:['공통수학1','공통수학2','대수','미적분1','미적분2','기하','확률과통계'],books:[{n:'라이트쎈',p:'신사고'},{n:'쎈',p:'신사고'},{n:'일품',p:'좋은책신사고'},{n:'블랙라벨',p:'진학사'},{n:'기본정석',p:'성문'},{n:'실력정석',p:'성문'},{n:'고쟁이',p:'이투스'},{n:'자이스토리',p:'자이스토리'},{n:'수매씽 개념',p:'천재'},{n:'개념원리',p:'개념원리'},{n:'마더텅',p:'마더텅'}]}
}

const c = {
  bg:'#F2F2F7', card:'#FFFFFF', card2:'#F2F2F7', bg3:'#E5E5EA',
  border:'rgba(0,0,0,.08)', border2:'rgba(0,0,0,.14)',
  txt1:'#1C1C1E', txt2:'#636366', txt3:'#AEAEB2',
  p:'#5856D6', pl:'rgba(88,86,214,.1)',
  g:'#34C759', gl:'rgba(52,199,89,.1)',
  o:'#FF9500', ol:'rgba(255,149,0,.1)',
  r:'#FF3B30', b:'#007AFF', bl:'rgba(0,122,255,.1)',
}

export default function CellLogPage() {
  const [tab, setTab] = useState('log')
  const [lv, setLv] = useState('초등')
  const [grade, setGrade] = useState('')
  const [stuId, setStuId] = useState('')
  const [semester, setSemester] = useState('')
  const [major, setMajor] = useState('')
  const [unit, setUnit] = useState('')
  const [bookSchool, setBookSchool] = useState('elementary')
  const [bookGrade, setBookGrade] = useState('')
  const [book, setBook] = useState('')
  const [section, setSection] = useState('concept_study')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [question, setQuestion] = useState('')
  const [weakness, setWeakness] = useState('')
  const [total, setTotal] = useState('')
  const [correct, setCorrect] = useState('')
  const [score, setScore] = useState('')
  const [wrongSum, setWrongSum] = useState('')
  const [solved, setSolved] = useState('')
  const [logs, setLogs] = useState<CellLog[]>([])
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState('')
  const [notifType, setNotifType] = useState('success')

  const loadLogs = useCallback(async () => {
    const { data } = await supabase.from('cell_logs').select('*').order('created_at', { ascending: false })
    if (data) setLogs(data as CellLog[])
  }, [])

  useEffect(() => { if (tab === 'cells') loadLogs() }, [tab, loadLogs])

  function showNotif(msg: string, type = 'success') {
    setNotif(msg); setNotifType(type)
    setTimeout(() => setNotif(''), 3000)
  }

  function getCurrKey() {
    if (lv === '고등') return HIGH_MAP[grade] || '공통수학1'
    return grade && semester ? `${grade}_${semester}` : null
  }

  async function saveRecord() {
    if (!stuId) { showNotif('학생을 선택해 주세요', 'error'); return }
    if (!semester) { showNotif('학기를 선택해 주세요', 'error'); return }
    if (!unit) { showNotif('단원을 선택해 주세요', 'error'); return }
    if (!book) { showNotif('교재를 선택해 주세요', 'error'); return }
    const stu = getStu(stuId)
    const sec = SECTIONS.find(s => s.k === section)
    setSaving(true)
    const { error } = await supabase.from('cell_logs').insert({
      student_id: stuId, student_name: stu?.name || '',
      grade, level: lv, semester, major, unit,
      book_name: `${bookGrade} ${book.split('(')[0]}`,
      section, section_label: sec?.l || '',
      title, description: desc, question, weakness,
      total_count: total ? parseInt(total) : null,
      correct_count: correct ? parseInt(correct) : null,
      wrong_count: (total && correct) ? parseInt(total) - parseInt(correct) : null,
      score: score ? parseInt(score) : null,
      wrong_summary: wrongSum,
      solved_count: solved ? parseInt(solved) : null,
    })
    setSaving(false)
    if (error) { showNotif('저장 실패: ' + error.message, 'error'); return }
    showNotif(`✅ ${stu?.name} · ${unit} · ${sec?.l} 저장됨!`)
    setTitle(''); setDesc(''); setQuestion(''); setWeakness('')
    setTotal(''); setCorrect(''); setScore(''); setWrongSum(''); setSolved('')
  }

  const curSec = SECTIONS.find(s => s.k === section)
  const currKey = getCurrKey()
  const currData = currKey ? CURRICULUM[currKey] : null
  const grades = Object.keys(STU_DATA[lv] || {})
  const stus = grade ? (STU_DATA[lv]?.[grade] || []) : []
  const bookData = BOOKS[bookSchool as keyof typeof BOOKS]

  const chip = (active: boolean, color = c.p, bg = c.pl) => ({
    padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
    border: `1.5px solid ${active ? color : c.border2}`,
    background: active ? color : c.card2,
    color: active ? '#fff' : c.txt2,
    fontSize: '13px', fontWeight: 600, transition: 'all .15s',
    display: 'inline-block'
  } as React.CSSProperties)

  const ifield = {
    width: '100%', padding: '12px 14px',
    background: c.bg, border: `1.5px solid ${c.border2}`,
    borderRadius: '12px', color: c.txt1, fontSize: '14px',
    fontFamily: 'inherit', outline: 'none'
  } as React.CSSProperties

  const card = {
    background: c.card, borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,.08)',
    overflow: 'hidden', marginBottom: '12px'
  } as React.CSSProperties

  const stepHd = (num: string, title2: string, done: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: `1px solid ${c.border}` }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: done ? c.g : c.p, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>{done ? '✓' : num}</div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: c.txt1 }}>{title2}</div>
    </div>
  )

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.txt1, fontFamily: '-apple-system, Pretendard, sans-serif' }}>

      {/* 알림 */}
      {notif && (
        <div style={{ position: 'fixed', top: 70, left: 16, right: 16, zIndex: 999, padding: '13px 16px', borderRadius: '12px', fontWeight: 600, fontSize: '13px', background: c.card, border: `1px solid ${notifType === 'error' ? 'rgba(255,59,48,.4)' : 'rgba(52,199,89,.4)'}`, color: notifType === 'error' ? c.r : c.g, boxShadow: '0 8px 32px rgba(0,0,0,.12)' }}>
          {notif}
        </div>
      )}

      {/* 헤더 */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: 'rgba(242,242,247,.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: c.p, letterSpacing: '-.5px' }}>CellLog</div>
          <div style={{ fontSize: 10, color: c.txt3, letterSpacing: '.5px' }}>NCTM LEARNING OS</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: c.o, background: c.ol, border: `1px solid rgba(255,149,0,.2)`, padding: '6px 14px', borderRadius: '20px' }}>🔥 학습중</div>
      </header>

      {/* 메인 */}
      <main style={{ paddingTop: 72, paddingBottom: 90 }}>

        {/* ═══ 기록 탭 ═══ */}
        {tab === 'log' && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ padding: '20px 0 12px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>학습 기록</div>
              <div style={{ fontSize: 13, color: c.txt3, marginTop: 3 }}>오늘도 한 셀씩 채워나가요 📚</div>
            </div>

            {/* STEP 1 */}
            <div style={card}>
              {stepHd('1', '학생 · 학기', !!(stuId && semester))}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 7 }}>수준</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {['초등', '중등', '고등'].map(l => (
                    <div key={l} style={{ ...chip(lv === l), flex: 1, textAlign: 'center' }}
                      onClick={() => { setLv(l); setGrade(''); setStuId(''); setSemester(''); setUnit(''); }}>
                      {l}{l === '초등' ? '🌱' : l === '중등' ? '📗' : '🎯'}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 7 }}>학년</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {grades.map(g => (
                    <div key={g} style={chip(grade === g, c.b, c.bl)} onClick={() => { setGrade(g); setStuId(''); }}>
                      {g}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 7 }}>학생</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {stus.length === 0
                    ? <span style={{ fontSize: 12, color: c.txt3 }}>학년을 먼저 선택해 주세요</span>
                    : stus.map(st => (
                      <div key={st.id} onClick={() => setStuId(st.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: '20px', cursor: 'pointer',
                        border: `1.5px solid ${stuId === st.id ? st.color : st.color + '40'}`,
                        background: stuId === st.id ? st.color : c.card2,
                        color: stuId === st.id ? '#fff' : c.txt2, fontSize: 13, fontWeight: 600
                      }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{st.name[0]}</div>
                        {st.name}
                      </div>
                    ))
                  }
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 7 }}>학기</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['1학기', '2학기'].map(sem => (
                    <div key={sem} style={chip(semester === sem)} onClick={() => setSemester(sem)}>{sem}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div style={card}>
              {stepHd('2', '단원 · 교재', !!(unit && book))}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 10 }}>단원 선택</div>
                {!currData
                  ? <div style={{ fontSize: 12, color: c.txt3, marginBottom: 14 }}>학생과 학기를 먼저 선택해 주세요</div>
                  : Object.entries(currData).map(([maj, mids]) => (
                    <div key={maj} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: c.txt3, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 7 }}>{maj}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {mids.map(mid => (
                          <div key={mid} onClick={() => { setMajor(maj); setUnit(mid); }} style={{
                            padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                            border: `1.5px solid ${unit === mid && major === maj ? c.g : c.border2}`,
                            background: unit === mid && major === maj ? c.g : c.card2,
                            color: unit === mid && major === maj ? '#fff' : c.txt2
                          }}>{mid}</div>
                        ))}
                      </div>
                    </div>
                  ))
                }
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 8 }}>교재</div>
                <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                  {[['초등', 'elementary'], ['중등', 'middle'], ['고등', 'high']].map(([label, val]) => (
                    <div key={val} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: `1.5px solid ${bookSchool === val ? c.o : c.border2}`, background: bookSchool === val ? c.o : c.card2, color: bookSchool === val ? '#fff' : c.txt2, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => { setBookSchool(val); setBook(''); setBookGrade(BOOKS[val as keyof typeof BOOKS].grades[0]); }}>
                      {label}
                    </div>
                  ))}
                </div>
                <select value={bookGrade} onChange={e => setBookGrade(e.target.value)} style={{ ...ifield, marginBottom: 10, cursor: 'pointer' }}>
                  {bookData.grades.map(g => <option key={g}>{g}</option>)}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                  {bookData.books.map(b => {
                    const k = `${b.n}(${b.p})`
                    return (
                      <div key={k} onClick={() => setBook(k)} style={{
                        padding: '10px 5px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: 11, fontWeight: 500, lineHeight: 1.35,
                        border: `1.5px solid ${book === k ? c.o : c.border2}`,
                        background: book === k ? c.o : c.card2,
                        color: book === k ? '#fff' : c.txt2
                      }}>
                        {b.n}
                        <span style={{ fontSize: 9, opacity: .6, display: 'block', marginTop: 1 }}>{b.p}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderBottom: `1px solid ${c.border}` }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.p, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>3</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>기록 입력</div>
                <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '20px', background: c.pl, color: c.p, fontSize: 11, fontWeight: 600 }}>{curSec?.l}</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 8 }}>학습 섹션</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {SECTIONS.map(sec => (
                    <div key={sec.k} style={chip(section === sec.k)} onClick={() => setSection(sec.k)}>{sec.l}</div>
                  ))}
                </div>

                {curSec?.t === 'test' && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <div style={{ background: c.bg, border: `1.5px solid ${c.border2}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="—"
                          style={{ width: '100%', background: 'none', border: 'none', color: c.txt1, fontSize: 24, fontWeight: 800, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                        <div style={{ fontSize: 10, fontWeight: 600, color: c.txt2, textTransform: 'uppercase', marginTop: 3 }}>총 문제</div>
                      </div>
                      <div style={{ background: c.bg, border: `1.5px solid ${c.border2}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <input type="number" value={correct} onChange={e => setCorrect(e.target.value)} placeholder="—"
                          style={{ width: '100%', background: 'none', border: 'none', color: c.txt1, fontSize: 24, fontWeight: 800, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                        <div style={{ fontSize: 10, fontWeight: 600, color: c.txt2, textTransform: 'uppercase', marginTop: 3 }}>맞은 문제</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{ background: c.bg, border: `1.5px solid rgba(255,59,48,.3)`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: c.r }}>{total && correct ? parseInt(total) - parseInt(correct) : '—'}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: c.txt2, textTransform: 'uppercase', marginTop: 3 }}>틀린 문제</div>
                      </div>
                      <div style={{ background: c.bg, border: `1.5px solid ${c.border2}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <input type="number" value={score} onChange={e => setScore(e.target.value)} placeholder="—"
                          style={{ width: '100%', background: 'none', border: 'none', color: c.txt1, fontSize: 24, fontWeight: 800, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                        <div style={{ fontSize: 10, fontWeight: 600, color: c.txt2, textTransform: 'uppercase', marginTop: 3 }}>점수</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 6 }}>오답 요약</div>
                    <textarea value={wrongSum} onChange={e => setWrongSum(e.target.value)} placeholder="어떤 문제를 틀렸는지..."
                      style={{ ...ifield, minHeight: 60, resize: 'none', lineHeight: 1.6, marginBottom: 12 }} />
                  </div>
                )}

                {curSec?.t === 'solve' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ background: c.bg, border: `1.5px solid ${c.border2}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <input type="number" value={solved} onChange={e => setSolved(e.target.value)} placeholder="—"
                        style={{ width: '100%', background: 'none', border: 'none', color: c.txt1, fontSize: 24, fontWeight: 800, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                      <div style={{ fontSize: 10, fontWeight: 600, color: c.txt2, textTransform: 'uppercase', marginTop: 3 }}>푼 문제</div>
                    </div>
                    <div style={{ background: c.bg, border: `1.5px solid ${c.border2}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <input type="number" value={correct} onChange={e => setCorrect(e.target.value)} placeholder="—"
                        style={{ width: '100%', background: 'none', border: 'none', color: c.txt1, fontSize: 24, fontWeight: 800, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                      <div style={{ fontSize: 10, fontWeight: 600, color: c.txt2, textTransform: 'uppercase', marginTop: 3 }}>맞은 문제</div>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 6 }}>제목 (선택)</div>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 소인수분해 1회차 개념정리" style={{ ...ifield, marginBottom: 12 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 6 }}>메모</div>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="오늘 공부한 내용, 어려웠던 점..."
                  style={{ ...ifield, minHeight: 80, resize: 'none', lineHeight: 1.6, marginBottom: 12 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 6 }}>❓ 질문</div>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="선생님에게 궁금한 것..."
                  style={{ ...ifield, minHeight: 60, resize: 'none', lineHeight: 1.6, marginBottom: 12 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: c.txt2, marginBottom: 6 }}>💡 나의 약점</div>
                <textarea value={weakness} onChange={e => setWeakness(e.target.value)} placeholder="스스로 느낀 약점..."
                  style={{ ...ifield, minHeight: 60, resize: 'none', lineHeight: 1.6, marginBottom: 16 }} />
                <button onClick={saveRecord} disabled={saving} style={{
                  width: '100%', padding: 16, background: saving ? c.txt3 : c.p, border: 'none', borderRadius: 12,
                  color: '#fff', fontSize: 16, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', boxShadow: saving ? 'none' : '0 4px 16px rgba(88,86,214,.3)'
                }}>{saving ? '저장 중...' : '🧬 Cell 저장하기'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ 셀 현황 탭 ═══ */}
        {tab === 'cells' && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ padding: '20px 0 12px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>셀 현황</div>
              <div style={{ fontSize: 13, color: c.txt3, marginTop: 3 }}>Supabase 실시간 데이터</div>
            </div>
            {logs.length === 0
              ? <div style={{ textAlign: 'center', padding: '60px 20px', color: c.txt3 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧬</div>
                <div>아직 기록이 없어요</div>
              </div>
              : logs.map(log => {
                const stu = getStu(log.student_id)
                const color = stu?.color || c.p
                return (
                  <div key={log.id} style={{ ...card, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>{log.student_name?.[0] || '?'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{log.unit}</div>
                        <div style={{ fontSize: 11, color: c.txt3 }}>{log.student_name} · {log.book_name} · {log.semester}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.pl, color: c.p }}>{log.section_label}</span>
                    </div>
                    {log.description && <div style={{ fontSize: 13, color: c.txt2, lineHeight: 1.6, marginBottom: 8 }}>{log.description}</div>}
                    {log.total_count ? <div style={{ fontSize: 12, background: c.bg, borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>총 {log.total_count}문제 · 맞은 {log.correct_count} · 틀린 {log.wrong_count}{log.score ? ` · ${log.score}점` : ''}</div> : null}
                    {log.question ? <div style={{ fontSize: 12, background: c.bl, borderRadius: 8, padding: '8px 12px', color: c.b, marginBottom: 6 }}>❓ {log.question}</div> : null}
                    <div style={{ fontSize: 11, color: c.txt3, marginTop: 6 }}>{new Date(log.created_at).toLocaleDateString('ko-KR')}</div>
                  </div>
                )
              })
            }
          </div>
        )}
      </main>

      {/* 바텀 네비 */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(242,242,247,.92)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${c.border}`, display: 'flex', padding: '8px 0' }}>
        {[{ key: 'log', icon: '📝', label: '기록' }, { key: 'cells', icon: '🧬', label: '셀 현황' }].map(item => (
          <button key={item.key} onClick={() => setTab(item.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}>
            <div style={{ fontSize: 22 }}>{item.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: tab === item.key ? c.p : c.txt3 }}>{item.label}</div>
          </button>
        ))}
      </nav>
    </div>
  )
}