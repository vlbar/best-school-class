import React, { useState, useRef, useEffect, useContext } from 'react'
import { Dropdown } from 'react-bootstrap'
import { LoadingList } from '../loading/LoadingList'
import { useInView } from 'react-intersection-observer'
import './BestSelect.less'

export const SelectContext = React.createContext()
const ToggleContext = React.createContext()

const BestSelect = ({
    onSelect, onDropdownToggle,
    fieldToDisplay = 'name', initialSelectedItem, placeholder = 'Выбрать', isDisableListClosing = false,
    variant = 'white', disabled = false,
    toggle, children, ...props
}) => {
    const [selectedItem, setSelectedItem] = useState(initialSelectedItem)
    const [isDropdownShow, setIsDropdownShow] = useState(false)

    // lazy initial selected item
    useEffect(() => {
        if(initialSelectedItem) {
            setSelectedItem(initialSelectedItem)
        }
    }, [initialSelectedItem])
    
    const onSelectItem = (item) => {
        let targetItem = undefined
        if(!selectedItem || selectedItem !== item)
            targetItem = item

        setIsDropdownShow(false)
        setSelectedItem(targetItem)
        if(onSelect) onSelect(targetItem)
    }

    const onDropdownToggleHandler = (show) => {
        if(dropdownLock.current)
            setIsDropdownShow(true)
        else
            setIsDropdownShow(show)
        onDropdownToggle()
    }

    // ну а как иначе 🤷‍♂️
    const dropdownLock = useRef(false)
    useEffect(() => {
        if(isDisableListClosing)
            dropdownLock.current = true
        else
            setTimeout(() => {
                dropdownLock.current = false
            }, 1)
    }, [isDisableListClosing])

    return (
        <Dropdown show={isDropdownShow} onToggle={onDropdownToggleHandler} {...props} className={'item-select' + ((props.className) ? ' ' + props.className :'')}>
            <ToggleContext.Provider value={{ selectedItem, fieldToDisplay, disabled, variant, placeholder }}>
                {toggle ? toggle(selectedItem) : <BestSelectToggle/>}
            </ToggleContext.Provider>
            <Dropdown.Menu style={{maxWidth: '90vh'}}>
                <SelectContext.Provider value={{ selectedItem, onSelectItem, fieldToDisplay }}>
                    {children}
                </SelectContext.Provider>
            </Dropdown.Menu>
        </Dropdown>
    )
}

export const BestSelectToggle = ({children, ...props}) => {
    const { selectedItem, fieldToDisplay, disabled, variant, placeholder } = useContext(ToggleContext)
    return (
        <Dropdown.Toggle variant={variant} disabled={disabled} {...props}>
            {children ? children : <span>{selectedItem ? selectedItem[fieldToDisplay] : placeholder}</span>}
        </Dropdown.Toggle>
    )
}

export const BestSelectList = ({isFetching = false, isSearch = false, isCanFetchMore = false, isCanAutoFetch = true, fetchItemsCallback, scrollListRef, notFoundMessage, errorMessage, emptyMessage, disableMessages = false, children, ...props}) => {
    const { ref, inView } = useInView({
        threshold: 0
    })

    //auto fetch
    useEffect(() => {
        if(inView && !isFetching && isCanAutoFetch) fetchItemsCallback()
    }, [inView])

    const getMessage = () => {
        if(children && !isFetching) {
            if(children.length == 0) {
                if(isSearch)
                    return (
                        <div className='m-2'>
                            <h6 className='text-center'>Ничего не найдено</h6>
                            <p className='text-muted'>
                                {notFoundMessage ? notFoundMessage : 'По вашему запросу ничего не найдено.'}
                            </p>
                        </div>
                    )
                else if(!isFetching)
                    return (
                        <div className='m-2'>
                            <h6 className='text-center'>Ничего нет</h6>
                            <p className='text-muted'>
                                {emptyMessage ? emptyMessage : 'Еще ничего не добавлено.'}
                            </p>
                        </div>
                    )
            }
        } else {
            if(!isFetching)
                return (
                    <div className='m-2'>
                        <h6 className='text-center'>Произошла ошибка</h6>
                        <p className='text-muted'>
                            {errorMessage ? errorMessage : 'Не удалось загрузить данные.'}
                        </p>
                    </div>
                )
        }

        return undefined
    }

    return (
        <ul ref={scrollListRef} {...props} className={'select-list' + ((props.className) ? ' ' + props.className :'')}>
            {children}
            {(!isFetching && isCanFetchMore) &&
                <button 
                    className="fetch-types-btn" 
                    onClick={() => fetchItemsCallback()}
                    ref={ref}
                >
                    Загрузить еще
                </button>
            }
            {!disableMessages && getMessage()}
            {isFetching && <LoadingList widths={[40, 55, 45, 60]} className='mt-2' itemClassName='ml-4' itemMarginBottom='1.2Rem'/>}
        </ul>
    )
}

export const SelectItemContext = React.createContext()

export const BestSelectItem = ({item, children, ...props}) => {
    const { selectedItem } = useContext(SelectContext)

    return (
        <div {...props} className={'select-list-item' + (((selectedItem) && selectedItem == item) ? ' selected':'') + ((props.className) ? ' ' + props.className:'')} >
            <SelectItemContext.Provider value={{item}}>
                {children ?
                    children
                    : <BestItemSelector/>
                }
            </SelectItemContext.Provider>
        </div>
    )
}

export const BestItemSelector = ({children, ...props}) => {
    const { onSelectItem, fieldToDisplay } = useContext(SelectContext)
    const { item } = useContext(SelectItemContext)

    return (
        <div onClick={() => onSelectItem(item)} {...props} className={'item-selector' + (props.className ? ' ' + props.className:'')}>
            {children ?
                children
                :<span>{item[fieldToDisplay]}</span>    
            }
        </div>
    )
}

export const BestSelectEditableItem = ({item, isCanEditPredicate, onUpdate, onDelete, ...props}) => {
    return (
        <BestSelectItem key={item.id} item={item} {...props}>
            <BestItemSelector/>
            {(isCanEditPredicate && isCanEditPredicate(item) || isCanEditPredicate == undefined) && 
                <>
                    {onUpdate && <span className='task-type-action' onClick={() => onUpdate(item)} title='Изменить'>
                        <i className='fas fa-pen fa-xs'/>
                    </span>}
                    {onDelete && <span className='task-type-action' onClick={() => onDelete(item)} title='Удалить'>
                        <i className="fas fa-times fa-xs"/>
                    </span>}
                </>
            }
        </BestSelectItem>
    )
}

export default BestSelect