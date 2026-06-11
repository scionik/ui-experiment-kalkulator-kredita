"use client"

import { useState, useMemo, useEffect, useRef } from "react"

const ANNUAL_RATE = 0.0699
const MAX_DTI = 0.45
const SALARY_MIN = 300
const SALARY_MAX = 10000
const SALARY_STEP = 100
const AMOUNT_MIN = 1000
const AMOUNT_MAX = 300000
const AMOUNT_STEP = 500

function calcMonthlyPayment(principal: number, years: number) {
  if (principal <= 0 || years <= 0) return 0
  const n = years * 12
  const r = ANNUAL_RATE / 12
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function calcMaxLoan(salary: number, years: number) {
  const maxPayment = salary * MAX_DTI
  const n = years * 12
  const r = ANNUAL_RATE / 12
  return Math.floor((maxPayment * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) / AMOUNT_STEP) * AMOUNT_STEP
}

function calcMinSalary(amount: number, years: number) {
  const n = years * 12
  const r = ANNUAL_RATE / 12
  const payment = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  return Math.ceil((payment / MAX_DTI) / SALARY_STEP) * SALARY_STEP
}

function fmtEur(val: number) {
  return val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtNum(val: number) {
  return val.toLocaleString("de-DE")
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#0015FF" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#0015FF" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#0015FF" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#0015FF" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 12 12" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: 1 }}>
      <path transform="matrix(1 0 0 1 5.152 5.211)" d="M0.821 3.283C0.821 3.283 0.821 0.410 0.821 0.410C0.821 0.302 0.777 0.197 0.701 0.120C0.624 0.043 0.519 0.000 0.410 0.000C0.410 0.000 0.000 0.000 0.000 0.000" vectorEffect="non-scaling-stroke" stroke="#0015FF" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
      <path transform="matrix(1 0 0 1 5.562 3.588)" d="M0.205 0.410C0.092 0.410 0.000 0.318 0.000 0.205C0.000 0.092 0.092 0.000 0.205 0.000" vectorEffect="non-scaling-stroke" stroke="#0015FF" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
      <path transform="matrix(1 0 0 1 5.767 3.588)" d="M0.000 0.410C0.113 0.410 0.205 0.318 0.205 0.205C0.205 0.092 0.113 0.000 0.000 0.000" vectorEffect="non-scaling-stroke" stroke="#0015FF" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
      <path transform="matrix(1 0 0 1 0.737 0.737)" d="M5.263 10.527C8.170 10.527 10.527 8.170 10.527 5.263C10.527 2.356 8.170 0.000 5.263 0.000C2.356 0.000 0.000 2.356 0.000 5.263C0.000 8.170 2.356 10.527 5.263 10.527Z" vectorEffect="non-scaling-stroke" stroke="#0015FF" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
      <path transform="matrix(1 0 0 1 5.152 8.494)" d="M0.000 0.000C0.000 0.000 1.696 0.000 1.696 0.000" vectorEffect="non-scaling-stroke" stroke="#0015FF" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  onChange: (val: number) => void
  min: number
  max: number
  step: number
  unit: string
  minLabel: string
  maxLabel: string
}

function SliderField({ label, value, onChange, min, max, step, unit, minLabel, maxLabel }: SliderFieldProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0

  return (
    <div className="flex flex-col gap-4 mb-6 last:mb-0">
      <div className="flex items-center justify-between">
        <span className="text-base font-normal leading-[18px] text-[#0A0B0C]">{label}</span>
        <span className="flex items-center gap-4 text-[18px] font-medium leading-5 text-[#0A0B0C]">
          {fmtNum(value)}
          <span className="h-5 min-w-5 flex items-center justify-center bg-[#E5E8FF] rounded-[4px] px-1 text-sm font-normal leading-5 text-[#0015FF]">
            {unit}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="slider w-full h-[6px] rounded-full outline-none cursor-pointer appearance-none"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />
      <div className="flex justify-between text-sm leading-4 font-normal text-[#B1B7C3]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}

export default function KreditKalkulator() {
  const [amount, setAmount] = useState(45000)
  const [years, setYears] = useState(15)
  const [salary, setSalary] = useState(1800)
  const [showHint, setShowHint] = useState(false)

  const minSalary = useMemo(() => Math.max(SALARY_MIN, calcMinSalary(amount, years)), [amount, years])
  const maxAmount = useMemo(() => Math.max(AMOUNT_MIN, calcMaxLoan(salary, years)), [salary, years])
  const monthlyPayment = useMemo(() => calcMonthlyPayment(amount, years), [amount, years])

  const prevMinSalary = useRef<number | null>(null)
  const prevMaxAmount = useRef<number | null>(null)
  useEffect(() => {
    if (prevMinSalary.current !== null) {
      if (minSalary > prevMinSalary.current || maxAmount < prevMaxAmount.current!) {
        setShowHint(true)
      }
    }
    prevMinSalary.current = minSalary
    prevMaxAmount.current = maxAmount
  }, [minSalary, maxAmount])

  function handleAmountChange(val: number) {
    const needed = calcMinSalary(val, years)
    if (salary < needed) setSalary(Math.min(needed, SALARY_MAX))
    setAmount(val)
  }

  function handleSalaryChange(val: number) {
    const max = calcMaxLoan(val, years)
    if (amount > max) setAmount(Math.max(max, AMOUNT_MIN))
    setSalary(val)
  }

  function handleYearsChange(val: number) {
    setYears(val)
    const needed = calcMinSalary(amount, val)
    if (salary < needed) setSalary(Math.min(needed, SALARY_MAX))
    const max = calcMaxLoan(salary, val)
    if (amount > max) setAmount(Math.max(max, AMOUNT_MIN))
  }

  return (
    <div className="min-h-screen bg-[#1a3aad] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[808px] flex flex-col items-center gap-4">
        <h1 className="text-white text-5xl font-bold text-center leading-tight tracking-tight">
          Tvoj keš kredit u brojkama
        </h1>
        <p className="text-white/75 text-[15px] text-center max-w-[480px] leading-relaxed">
          Unesi željeni iznos keš kredita, period otplate i svoju mesečnu zaradu, a
          kalkulator će ti odmah prikazati okvirnu mesečnu ratu i pomoći ti da vidiš šta ti
          je realno dostupno.
        </p>

        {/* Card */}
        <div
          className="w-full mt-3 bg-white rounded-xl p-6 flex gap-6"
          style={{ filter: "drop-shadow(0px 0px 0.5px #1414141A) drop-shadow(0px 4px 4px #14141433)" }}
        >
          {/* Left panel */}
          <div className="flex-1 min-w-0 bg-white rounded-xl p-4 flex flex-col"
            style={{ outline: "0.5px solid #E6E6E6", outlineOffset: "-0.5px" }}>
            <div className="flex items-center gap-2 text-xl font-medium leading-6 tracking-tight text-[#0A0B0C] mb-6">
              <GridIcon />
              Kalkulator keš kredita
            </div>

            <SliderField
              label="Iznos kredita"
              value={amount}
              onChange={handleAmountChange}
              min={AMOUNT_MIN}
              max={maxAmount}
              step={AMOUNT_STEP}
              unit="€"
              minLabel={`${fmtNum(AMOUNT_MIN)} €`}
              maxLabel={`${fmtNum(maxAmount)} €`}
            />

            <SliderField
              label="Period otplate"
              value={years}
              onChange={handleYearsChange}
              min={5}
              max={25}
              step={1}
              unit="godina"
              minLabel="5"
              maxLabel="25"
            />

            <SliderField
              label="Mesečna zarada"
              value={salary}
              onChange={handleSalaryChange}
              min={minSalary}
              max={SALARY_MAX}
              step={SALARY_STEP}
              unit="€"
              minLabel={`${fmtNum(minSalary)} €`}
              maxLabel={`${fmtNum(SALARY_MAX)} €`}
            />

            {showHint && (
              <div
                className="flex items-start gap-2 rounded-[6px] px-2 py-1 mt-4 animate-fadeInUp"
                style={{ background: "#F5F6FF", outline: "0.5px solid #E5E8FF", outlineOffset: "-0.5px" }}
              >
                <InfoIcon />
                <p className="text-xs leading-4 font-normal text-[#0015FF]">
                  Opsezi zavise od iznosa kredita, perioda otplate i mesečne zarade — automatski ih prilagođavamo kako bi kombinacija uvek bila realna.
                </p>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between bg-[#F5F6FF] rounded-xl p-4">
            <div className="flex flex-col gap-1">
              <div className="text-base font-medium leading-[18px] text-[#0A0B0C]">Mesečna rata</div>
              <div className="text-[28px] font-extrabold leading-8 tracking-tight text-[#0015FF]">
                € {fmtEur(monthlyPayment)}
              </div>
              <p className="text-xs leading-4 text-[#606571] mt-3">
                Približan iznos koji bi plaćao/la svakog meseca tokom perioda otplate koji si izabrao/la.
              </p>
            </div>

            <div className="flex items-center justify-end gap-4">
              <span className="text-sm leading-5 font-normal text-[#606571]">Spreman/a za sledeći korak?</span>
              <button className="h-9 flex items-center justify-center bg-[#0015FF] hover:bg-[#0010cc] transition-colors text-white text-sm font-medium rounded-[6px] px-4 cursor-pointer border-none">
                Zatraži kredit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
