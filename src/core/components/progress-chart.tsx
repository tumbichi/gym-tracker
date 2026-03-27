'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function ProgressChart({
  data,
}: {
  data: { date: string; weight: number }[]
}) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='date'
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric',
            })
          }
        />
        <YAxis
          label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          labelFormatter={(value) =>
            new Date(value).toLocaleDateString('es-ES')
          }
          formatter={(value) => [`${value} kg`, 'Peso máximo']}
        />
        <Line
          type='monotone'
          dataKey='weight'
          stroke='hsl(var(--primary))'
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
