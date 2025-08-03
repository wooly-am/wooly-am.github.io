
function main(){
    //console.log(175513860000- Date.now())

    document.getElementById("timer").innerHTML = diff_to_text(1755124200000 - Date.now())
    setTimeout(main, 1000);
}

function diff_to_text(time){
    return Math.floor(time / 86400000) + " Days, " + Math.floor((time % 86400000)/ 3600000) + " Hours " + Math.floor( (time % 3600000) / 60000) + " Minutes " + Math.floor((time % 60000) / 1000) +" Seconds"
}

main()