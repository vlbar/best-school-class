import React from 'react'
import './LoadingList.less'

export const LoadingList = ({widths = [20, 70, 50, 40, 60], itemHeight='1Rem', itemMarginLeft = '1Rem', itemMarginBottom = '1Rem', itemClassName = '', itemStyle = {}, className = '', style = {}}) => {
    return (
        <div className={className} style={style}>
            {widths.map((x, i) => {
                return <div 
                    key={i} 
                    className={'fake-item ' + itemClassName} 
                    style={{width: `${x}%`, height: itemHeight, marginLeft: itemMarginLeft, marginBottom: itemMarginBottom,  ...itemStyle}}
                />
            })}
        </div>
    )
}

export const LoadingItem = ({width = '20%', height = '1Rem', ...props}) => {
    return (
        <div 
            {...props}
            className={'fake-item' + (props.className ? ' ' + props.className:'')}
            style={{width: width, height: height, ...props.style}}
        />
    )
}