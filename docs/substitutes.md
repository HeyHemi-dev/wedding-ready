[ReadMe](/README.md)

# Recommended substitutes for overused hooks/functions

Many hooks/functions are used by default when a better tool or pattern exists.  
This guide outlines common overused hooks/functions and suggests clearer, more effective alternatives.

## useEffect  
- data fetching: useQuery/useMutation with server prefetching and de/hydrating data  
- window size/scroll: prefer CSS where possible or useIntersectionObserver from react-use  
- animation/interaction: framer-motion instead of manual DOM changes  
- forms: react-hook-form  

## useState  
- derived state: useMemo or const (don’t store what can be calculated)  
- input fields: react-hook-form for better control and validation  
- global/shared state: jotai  
- async state: useQuery/useMutation for loading/error management  
- toggles: useToggle from react-use  
- temporary/calculated UI state: just use a const inside your component  

## useCallback  
- "optimization": often unnecessary unless you're passing callbacks to memoized components  
- prefer inline functions unless you have a specific performance issue  

## useContext  
- complex/dynamic state management: prefer jotai for shared state  
- Fine for static values (like theme or locale), but avoid for dynamic state  

## useRef  
- storing values: useState is better for values that should trigger re-renders  
- Best for accessing DOM nodes or mutable values that don't trigger re-renders  

## prop drilling  
- Overused when context or a shared state lib (like jotai) is a better fit  
- Lifting state too far can create unnecessary coupling  
