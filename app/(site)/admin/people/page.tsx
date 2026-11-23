import PeopleWorkspace, { type PeopleQuery } from "./PeopleWorkspace";
export default function PeoplePage({
  searchParams,
}: {
  searchParams: PeopleQuery;
}) {
  return <PeopleWorkspace query={searchParams} />;
}
