"use client"

import { SearchParam } from "@/variables/url"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

type SearchParamFn = () => void

export function useSearchParamsFn () {
    const searchParams = useSearchParams()
    const router = useRouter()

    const getParamFn = useCallback((param: SearchParam, val: string) => {
        switch(param) {
            case SearchParam.RETURN_URL:
                return () => val === "./" ? router.back() : router.push(val)
        }
    }, [router])
    
    const fns: Map<SearchParam, SearchParamFn | undefined> = useMemo(() => {
        const res: Map<SearchParam, SearchParamFn | undefined> = Object
            .values(SearchParam)
            .reduce<Map<SearchParam, SearchParamFn | undefined>>(
            (acc, param) => {
                acc.set(param, undefined); // Initialize with undefined
                return acc;
            },
            new Map()
        );

        Object.values(SearchParam).forEach(param => {
            const val = searchParams.get(param)
            res.set(param, val ? getParamFn(param, val) : undefined)
        })
        return res
    }, [searchParams, getParamFn])

    return fns
}