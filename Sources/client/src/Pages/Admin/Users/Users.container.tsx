import { useQuery } from "@tanstack/react-query";
import Users from "./Users";
import { getAllUsers } from "../../../utils/Api/Users";

function UsersContainer() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(),
    });

    return <Users users={data?.data} isLoading={isLoading} error={error} />;
}

export default UsersContainer;
