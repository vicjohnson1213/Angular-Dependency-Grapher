import { StoreProvider } from "../shared/providers/store.provider";
import { UserProvider } from "../shared/providers/user.provider";

export class DashboardPage {
    constructor(
        private storeProv: StoreProvider,
        private userProv: UserProvider
    ) {}
}