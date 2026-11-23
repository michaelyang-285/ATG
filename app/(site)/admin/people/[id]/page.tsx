import PeopleWorkspace, { type PeopleQuery } from "../PeopleWorkspace";
export const metadata = {
  title: "Person profile",
  robots: { index: false, follow: false },
};
export default function PersonPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: PeopleQuery;
}) {
  return (
    <PeopleWorkspace key={params.id} id={params.id} query={searchParams} />
  );
}
