const theme_set = ["cyberdusk", "pink"];
var fake_enum = 0;
// yeah ik i dont know js well. but it sucks. dumb language

function set_theme(offset){
    fake_enum = (fake_enum + theme_set.length + offset) % (theme_set.length);
    console.log("Theme:", theme_set[fake_enum]);
    document.documentElement.setAttribute("data-theme", theme_set[fake_enum]);
    return theme_set[fake_enum];
}