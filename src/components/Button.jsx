import { forwardRef } from 'react'

const Button = forwardRef(({
    children,
    variant = "default", // success | danger | warning | info
    size = 'md',
    isLoading = false,
    disabled = false,
    type = 'button',
    outline = false,
    ...props
}, ref) => {
    return (
        <button
            {...props}
            ref={ref}
            type={type}
            className={`btn${isLoading ? ' is-loading' : ''} ${props?.className ?? ''} ${variant} ${size}${outline ? ' btn-outline' : ''}`}
            disabled={isLoading || disabled}
            >
            {/* {isLoading &&
                <ButtonLoader />
            } */}
            {children}
        </button>
    )
})

export default Button