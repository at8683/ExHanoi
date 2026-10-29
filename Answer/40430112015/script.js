const prev  = document.getElementById('btn-prev');
const start = document.getElementById('btn-start');
const stop  = document.getElementById('btn-stop');
const next  = document.getElementById('btn-next');
const end   = document.getElementById('btn-end');
const input = document.getElementById('disk-numbers');
const exHanoi1 = document.getElementById('exhanoi_1');
const exHanoi2 = document.getElementById('exhanoi_2');
const exHanoi3 = document.getElementById('exhanoi_3');
const exHanoi4 = document.getElementById('exhanoi_4');
const exHanoi5 = document.getElementById('exhanoi_5');
let exHanoi;
let moves = [];
let backMoves = []
let TIME = 500;

const rods = {
    A : document.getElementById('A'),
    B : document.getElementById('B'),
    C : document.getElementById('C'),
    D : document.getElementById('D')
}

let disks = [];
function diskCreator(number, className){
    for(let i = 0 ; i < number; i++){
        const disk = document.createElement("div");
        disk.classList.add(className);

        if(window.innerWidth < 480)
            disk.style.width = `calc(60px + ${(number - i*2)}px)`;
        else if(window.innerWidth < 768)
            disk.style.width = `calc(90px + ${(number - i*3)}px)`;
        else if(window.innerWidth < 992)
            disk.style.width = `calc(130px + ${(number - i*4)}px)`;
        else
            disk.style.width = `calc(170px + ${(number - i*5)}px)`;
        disk.innerText = i + 1;
        disks.push(disk);
    }
}

// for Move A --> B use this: moves.push([A, B])

// Classic Hanoi: move n disks from "from" to "to" using "via" as helper
function hanoi(from, via, to, n) {
    if (n <= 0)
        return
    hanoi(from, to, via, n - 1)   // 1) move the n-1 small disks out of the way (onto via)
    moves.push([from, to])        // 2) move the biggest disk
    hanoi(via, from, to, n - 1)   // 3) put the n-1 small disks back on top of it
}

// Helper for exHanoi_1 and exhanoi_3.
// pos[k] = rod where disk k is (disk 0 is the biggest one).
// Moves every disk from k to the last one onto the rod "target".
function gather(pos, k, target, rodNames) {
    if (k >= pos.length)
        return
    if (pos[k] === target) {
        // disk k is already where it should be, just handle the smaller ones
        gather(pos, k + 1, target, rodNames)
        return
    }
    // third rod = the one that is neither where disk k is, nor the target
    const other = rodNames.find(r => r !== pos[k] && r !== target)
    gather(pos, k + 1, other, rodNames)   // 1) all smaller disks go to the third rod
    moves.push([pos[k], target])          // 2) disk k moves to the target
    pos[k] = target
    gather(pos, k + 1, target, rodNames)  // 3) all smaller disks come on top of it
}

function exHanoi_1(start, aux, end, n) {
    n = Number(n)
    const pos = []
    for (let i = 0; i < 6 * n; i++) {
        const r = i % 6
        if (r < 3)
            pos.push(end)      // 3 disks of every group are on the third rod
        else if (r < 5)
            pos.push(aux)      // 2 disks of every group are on the second rod
        else
            pos.push(start)    // 1 disk of every group is on the first rod
    }
    gather(pos, 0, end, [start, aux, end])
}  

function exHanoi_2(A, B, C, D, n) {
    n = Number(n)
    // disk numbers: 1 (biggest, bottom) ... n (smallest, top)
    for (let k = 1; k <= n; k += 2) {
        const count = n - k
        hanoi(A, D, B, count)        // disks k+1..n: A -> B
        moves.push([A, C])           // disk k (odd) -> C
        if (k + 1 > n)
            break
        hanoi(B, D, A, count - 1)    // disks k+2..n: B -> A
        moves.push([B, D])           // disk k+1 (even) -> D
    }
}

function exhanoi_3(A, B, C, n) {
    n = Number(n)
    const pos = []
    for (let i = 0; i < 5 * n; i++) {
        if (i % 5 < 2)
            pos.push(A)        // 2 disks of every group are on the first rod
        else
            pos.push(B)        // 3 disks of every group are on the second rod
    }
    gather(pos, 0, C, [A, B, C])
}

function exhanoi_4(A, B, C, D, n) {
    // Allowed moves: A-C, A-D, B-C, B-D  => the rods form a circle A - C - B - D - A
    const circle = [A, C, B, D]
    function go(m, from, to) {
        if (m === 0)
            return
        const i = circle.indexOf(from)
        const j = circle.indexOf(to)
        const diff = (j - i + 4) % 4
        if (diff === 2) {
            // opposite rods: the big disk must make 2 steps (via q), small disks wait on p
            const p = circle[(i + 1) % 4]
            const q = circle[(i + 3) % 4]
            go(m - 1, from, p)
            moves.push([from, q])
            moves.push([q, to])
            go(m - 1, p, to)
        } else {
            // neighbour rods: small disks wait on z (the other neighbour of "from")
            const z = (diff === 1) ? circle[(i + 3) % 4] : circle[(i + 1) % 4]
            go(m - 1, from, z)
            moves.push([from, to])
            go(m - 1, z, to)
        }
    }
    go(Number(n), A, C)
}

function exhanoi_5(A, B, C, D, n) {
    // Allowed moves: only neighbours in A - B - C - D
    const names = [A, B, C, D]
    function go(m, from, to) {      // from / to are positions 0..3
        if (m === 0 || from === to)
            return
        const dir = to > from ? 1 : -1
        let cur = from              // where the biggest disk is now
        let stack = from            // where the m-1 smaller disks are now
        while (cur !== to) {
            const nxt = cur + dir
            // choose the nearest rod that is neither cur nor nxt for the small disks
            let t = -1
            for (let r = 0; r < 4; r++) {
                if (r === cur || r === nxt)
                    continue
                if (t === -1 || Math.abs(r - stack) < Math.abs(t - stack))
                    t = r
            }
            go(m - 1, stack, t)
            stack = t
            moves.push([names[cur], names[nxt]])
            cur = nxt
        }
        go(m - 1, stack, to)
    }
    go(Number(n), 0, 3)
}

function moveDisks(from, to){
    const fromEl = rods[from];
    const toEl = rods[to];
    const disk = fromEl.firstChild;
    if(TIME > 200){
        disk.animate([
            {bottom: "500px"},
            {bottom: "0"}
        ], TIME-200)
    }
    toEl.insertBefore(disk, toEl.firstChild);
}

function start_stop(){
    if(start.classList != "btn-disabled")
        start.classList.add("btn-disabled")
    else
        start.classList.remove("btn-disabled");

    const myInterval = setInterval(() =>{
        if(moves.length === 0)
            return
        const [from, to] = moves.shift();
        backMoves.push([from, to]);
        moveDisks(from, to);
        if(moves.length < 1){
            stop.click();
            next.classList.add("btn-disabled");
            start.classList.add("btn-disabled");
            end.classList.add("btn-disabled");
        }
        console.log(`${from} -----> ${to}`);
    },TIME);

    stop.addEventListener("click", () => {
        stop.classList.add("btn-disabled");
        start.classList.remove("btn-disabled");
        clearInterval(myInterval);
    })
}
function nextMove(){
    next.classList.remove("btn-disabeld");
    prev.classList.remove("btn-disabeld");
    const [from, to] = moves.shift();
    backMoves.push([from, to]);
    moveDisks(from, to);
    console.log(`${from} -----> ${to}`);
    if(moves.length < 1){
        stop.click();
        next.classList.add("btn-disabled");
        start.classList.add("btn-disabled");
        end.classList.add("btn-disabled");
    }

}
function prevMove(){
    if(backMoves.length < 1)
        return;
    const [to, from] = backMoves.pop();
    moves.unshift([to, from]);
    moveDisks(from, to);
    console.log(`${from} -----> ${to}`);
    if(backMoves.length < 1)
        prev.classList.add("btn-disabled")
}
function endMoves(){
    stop.click();
    TIME = 1;
    start.click();
}
input.addEventListener("keydown", (e) => {
    if(e.key == 'Enter')
        exHanoi1.click();
})
document.addEventListener("keydown", (e) => {;
    switch (e.key) {
        case 'a':
            prev.click();
            break;
        case 'd':
            next.click();
            break;
        case 's':
            start.click();
            break;
        case ' ':
            stop.click();
            break;
    }
})
function buttonsWorks(){
    start.classList.remove("btn-disabled");
    if(backMoves.length > 0)
        prev.classList.remove("btn-disabled");


    next.classList.remove("btn-disabled");
    end.classList.remove("btn-disabled");
    exHanoi1.classList.add("btn-disabled");
    exHanoi2.classList.add("btn-disabled");
    exHanoi3.classList.add("btn-disabled");
    exHanoi4.classList.add("btn-disabled");
    exHanoi5.classList.add("btn-disabled");
    input.classList.add("btn-disabled");
    input.disabled = true;

    start.addEventListener("click", () =>{
        stop.classList.remove("btn-disabled");
        start_stop();
        prev.classList.remove("btn-disabled");
        if(moves.length < 1){
            next.classList.add("btn-disabled");
            end.classList.add("btn-disabled");
            stop.click();
            start.classList.add("btn-disabled");
        }
    })
    next.addEventListener("click", () => {
        nextMove();
        prev.classList.remove("btn-disabled");
    })
    prev.addEventListener("click", () => {
        prevMove();
        next.classList.remove("btn-disabled");
        start.classList.remove("btn-disabled");
        end.classList.remove("btn-disabled");
    })
    end.addEventListener("click", () => {
        endMoves();
    })
}
//.............................ExHanoi Number 1..................................\\
exHanoi1.addEventListener("click", () => {
    if(input.value === ""){
        alert("Enter A Number First")
        return
    }
    const number = input.value;
    console.log(number);
    if((number < 0) || (number > 7)){
        alert("Your Number Is Not In The Range")
        location.reload();
        return
    }
    
    diskCreator(6*number, "disk");

    let index = 6*number - 1;
    while(index >= 0){
        rods.A.appendChild(disks[index])
        index--;
        for(let j = 0; j < 2; j++){
            rods.B.appendChild(disks[index])        
            index--;
        }
        for(let j = 0; j < 3; j++){
            rods.C.appendChild(disks[index])        
            index--;
        }
    }
    buttonsWorks()
    exHanoi_1('A', 'B', 'C', number);
    console.log(`Number Of Moves : ${moves.length}`);
    
})

//.............................ExHanoi Number 2..................................\\
exHanoi2.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 7) {
        alert("Your Number Is Not In The Range");
        return;
    }
    rods.D.classList.remove("noDisplay");
    diskCreator(number, "disk");
    for (let index = number - 1; index >= 0; index--) {
        rods.A.appendChild(disks.pop());
    }
    buttonsWorks();
    exHanoi_2("A", "B", "C", "D", number);
    console.log(`Number Of Moves : ${moves.length}`);
});


//.............................ExHanoi Number 3..................................\\
exHanoi3.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 7) {
        alert("Your Number Is Not In The Range");
        return;
    }
    diskCreator(5 * number, "disk");
    for (let index = 5 * number - 1; index >= 0; index-=5) {
        rods.B.appendChild(disks[index]);
        rods.B.appendChild(disks[index-1]);
        rods.B.appendChild(disks[index-2]);
        rods.A.appendChild(disks[index-3]);
        rods.A.appendChild(disks[index-4]);
    }
    buttonsWorks();
    exhanoi_3("A", "B", "C", number);
    console.log(`Number Of Moves : ${moves.length}`);
});


//.............................ExHanoi Number 4..................................\\
exHanoi4.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First")
        return
    }
    const number = input.value;
    if ((number < 0) || (number > 7)) {
        alert("Your Number Is Not In The Range")
        location.reload();
        return
    }
    rods.D.classList.remove("noDisplay")
    diskCreator(number, "disk")

    for (let index = number - 1; index >= 0; index--)
        rods.A.appendChild(disks.pop());
    buttonsWorks()
    exhanoi_4('A', 'B', 'C', 'D', number)
    console.log(`Number Of Moves : ${moves.length}`);
})

//.............................ExHanoi Number 5..................................\\
exHanoi5.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 7) {
        alert("Your Number Is Not In The Range");
        return;
    }
    rods.D.classList.remove("noDisplay");
    diskCreator(number, "disk");
    for (let index = number - 1; index >= 0; index--) {
        rods.A.appendChild(disks.pop());
    }
    buttonsWorks();
    exhanoi_5("A", "B", "C", "D", number);
    console.log(`Number Of Moves : ${moves.length}`);
});
