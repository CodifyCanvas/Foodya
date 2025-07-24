import { mutate } from "swr"

export const refreshData = (apiEndpoint: string) => {
    mutate(apiEndpoint)
}