import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "../api/user.api";
import { login } from "../store/slice/authSlice";

// Restores the session from the accessToken cookie on any route.
// Never redirects — a logged-out visitor is a valid state here.
export const hydrateAuth = async ({ context }) => {
    try {
        const { queryClient, store } = context;
        if (store.getState().auth.isAuthenticated) return;
        const data = await queryClient.ensureQueryData({
            queryKey: ["currentUser"],
            queryFn: getCurrentUser,
        });
        if (data?.user) store.dispatch(login(data.user));
    } catch {
        // no valid cookie — stay logged out
    }
};

export const checkAuth = async ({ context }) => {
    try {
        const { queryClient, store } = context;
        const data = await queryClient.ensureQueryData({
            queryKey: ["currentUser"],
            queryFn: getCurrentUser,
        });
        if(!data?.user) return false;
        store.dispatch(login(data.user));
        const {isAuthenticated} = store.getState().auth;
        if(!isAuthenticated) return false;
        return true
    } catch (error) {
        console.log(error)
        return redirect({to: "/auth",})
        
       
    }
};
