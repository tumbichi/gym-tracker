import { ExerciseDetailFeature } from '@modules/exercises/features/exercise-detail.feature'

interface ExerciseDetailPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Exercise Detail Page
 *
 * Thin shell — delegates all logic and UI to ExerciseDetailFeature.
 */
export default async function ExerciseDetailPage({
  params,
}: ExerciseDetailPageProps) {
  const { slug } = await params
  return <ExerciseDetailFeature slug={slug} />
}
