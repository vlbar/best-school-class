import React, { useEffect } from 'react'
import { PAGE_TITLE } from '../../config/page-metatags'

const DEFAULT_PREFIX = ''
const DEFAULT_POSTFIX = PAGE_TITLE
const DEFAULT_DIVIDER = '-'

export default function usePageTitle({title, prefix, postfix, divider}) {
    useEffect(() => {
        let dividerPart = ` ${DEFAULT_DIVIDER} `
        if(divider)
            if(divider.length == 0) dividerPart = ' '
            else dividerPart = ` ${divider} `   
        
        let prefixPart = getPartIfExists(prefix, DEFAULT_PREFIX)
        if(prefixPart?.length > 0 && (title?.length > 0 || postfix?.length > 0)) 
            prefixPart += dividerPart

        let postfixPart = getPartIfExists(postfix, DEFAULT_POSTFIX)
        if(postfixPart?.length > 0 && title?.length > 0) 
            postfixPart = dividerPart + postfixPart 

        document.title = prefixPart + getPartIfExists(title, '') + postfixPart
    }, [title])
}

function getPartIfExists(part, defaultPart) {
    if(part?.length > 0)
        return part
    else return defaultPart
}
