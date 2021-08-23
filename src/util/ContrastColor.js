
export default function getContrastColor(code) {
    code = code.substr(1);
    const red = parseInt(code.substr(0, 2), 16)
    const green = parseInt(code.substr(2, 2), 16)
    const blue = parseInt(code.substr(4, 2), 16)
    
    var sum = Math.round(((red * 299) + (green * 587) + (blue * 114)) / 1000);
    return (sum > 128) ? 'black' : 'white';
}