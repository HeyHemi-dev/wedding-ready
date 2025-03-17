export default async function UserPage({ params }: { params: { handle: string } }) {
  const { handle } = await params

  return <div>UserPage for {handle}</div>
}
