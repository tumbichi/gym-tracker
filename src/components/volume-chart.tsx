'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function VolumeChart({ data }: { data: { week: string; volume: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis label={{ value: 'Volumen (kg)', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => [`${value} kg`, 'Volumen total']} />
        <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}