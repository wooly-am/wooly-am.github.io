
//Creating posts: in the post list, create a new post with the below variables. put the image name for thumb, and put the photo in
// src/home/thumbs. if you are using a new tag, add it to the table below. please tag if wip!!!
import data from './articles.json' with { type: 'json' };

const tags = data.Tags;

console.log(tags);

class project{
    constructor(thumb, title, year, month, day, description, link, tags){
        this.thumb = "src/img/home/thumbs/" + thumb; //string
        this.title = title; //string
        this.date = new Date(Date.UTC(year, month, day)); // all are int
        this.description = description; //string
        this.link = link; //string
        this.tags = tags; //string array
        this.pinned = "Pinned" in tags;
        this.wip = "WIP" in tags;
    }
}



function init_table(length){
    let innerHTML = "";
    for (let i = 0; i < length; i++){
        innerHTML += "<tr id='" + i + "'></tr>";
    }
    document.getElementById("Projects").innerHTML = innerHTML;
}

function string_in_tags(str, arr){
    for(let a in arr){
        if (str === arr[a]){
            return true
        }
    }
    return false;
}

function chrono_sort(){
    let sorted = [];
    let pin_count = 0;
    let show_wip = document.getElementById("wip").checked;
    let selected_tag = document.getElementById("drop").value;

    for(let i = 1; i < data.data.length; i++){
        console.log(data.data[i]);
        if(!show_wip && "WIP" in data.data[i].tags){continue;}

        console.log(selected_tag)
        console.log(data.data[i].tags)

        if(selected_tag !== "Show All" && !string_in_tags(selected_tag, data.data[i].tags) ){
            continue
        }

        if("Pinned" in data.data[i].tags){
            pin_count++;
            sorted.push(data.data[i]);
        }

        if(sorted.length === 0){
            sorted.push(data.data[i]);
        }
        else {
            let j = ("Pinned" in data.data[i].tags) ? 0 : pin_count;
            for (; j < sorted.length; i++) {
                if (new Date(Date.UTC(sorted[j].year, sorted[j].month, sorted[j].day)) < new Date(Date.UTC(data.data[i].year, data.data[i].month, data.data[i].day))) {
                    break;
                }

            }
            sorted.splice(j, 0, data.data[i]);
        }
    }
    console.log(sorted)
    init_table(sorted.length);
    for(let k = 0; k < sorted.length; k++){
        document.getElementById(k.toString()).innerHTML = "<td><a href='" + sorted[k].link + "'><div class='title'>"+ sorted[k].title +"</div><div class='date'>" + new Date(Date.UTC(sorted[k].year, sorted[k].month, sorted[k].day)).toDateString() + "</div><div class='body'>" + sorted[k].description + "</div><div class='tags'>" + sorted[k].tags.toString() + "</div></td><td><div class='article_photo'><img src='" + sorted[k].thumb + "' alt=''></div></a></td>";
    }
}

let drop = document.createElement("SELECT");
drop.id = "drop";
let options = [];
let n = 0;
for (let tag in tags){
    options[n] = document.createElement("option");
    options[n].text = tags[tag];
    drop.add(options[n]);
    n++;
}
document.getElementById("filters").appendChild(drop);

document.getElementById("filters").addEventListener("click", () => chrono_sort());


chrono_sort();