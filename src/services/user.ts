import api from "../api/api";
import type {ProfileRead, ProfileWrite} from "../types/user";

export async function getProfile() {
    const { data } = await api.get("accounts/user/profile/");
    return data as ProfileRead;
}

export async function updateProfile(body: ProfileWrite, asMultipart = false) {
    if (asMultipart) {
        const fd = new FormData();
        Object.entries(body).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                if (key.startsWith("user.")) {
                    // flatten user fields: user.first_name -> first_name for serializer source mapping
                    fd.append(key.split(".")[1], String(val));
                } else {
                    fd.append(key, val as any);
                }
            }
        });
        const { data } = await api.patch("accounts/user/update-profile/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data as ProfileRead;
    }
    const { data } = await api.patch("accounts/user/update-profile/", body);
    return data as ProfileRead;
}

export async function requestEmailChange(new_email: string, user_id?: string) {
    const { data } = await api.post("accounts/user/request-email-change/", { new_email, user_id });
    return data as { message: string; otp_token: string };
}

export async function confirmEmailChange(otp_token: string, code: string) {
    const { data } = await api.post("accounts/user/confirm-email-change/", { otp_token, code });
    return data as { message: string };
}
