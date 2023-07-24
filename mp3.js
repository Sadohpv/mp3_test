const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_KEY = "USER";

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playlist = $('.playlist');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');


const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom : false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_KEY)) || {},
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_KEY,JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'Sing For The Moment',
            singer: 'Eminem',
            path: './music/song1.mp3',
            image: 'img/1.png',
        },
        {
            name: 'Ngày Lang Thang',
            singer: 'Đen Vâu',
            path: './music/song2.mp3',
            image: './img/2.png',
        },
        {
            name: 'Lộn Xộn',
            singer: 'Đen Vâu',
            path: './music/song3.mp3',
            image: './img/3.png',
        },
        {
            name: 'Lộn Xộn 2',
            singer: 'Đen Vâu',
            path: './music/song4.mp3',
            image: './img/4.jpg',
        },
        {
            name: 'Mơ',
            singer: 'Đen Vâu',
            path: './music/song5.mp3',
            image: './img/5.png',
        },
        {
            name: 'Lối Nhỏ',
            singer: 'Đen Vâu',
            path: './music/song6.mp3',
            image: './img/6.png',
        },
        {
            name: 'Đưa Nhau Đi Trốn',
            singer: 'Đen Vâu',
            path: './music/song7.mp3',
            image: './img/7.png',
        },
        {
            name: 'Mượn Rượu Tỏ Tình',
            singer: 'Big Daddy',
            path: './music/song8.mp3',
            image: './img/8.jpg',
        },
        {
            name: 'Đến Bao Giờ',
            singer: 'Dat Maniac',
            path: './music/song9.mp3',
            image: './img/9.png',
        },
        {
            name: 'Đời Thường 3',
            singer: 'Dat Maniac',
            path: './music/song10.mp3',
            image: './img/10.jpg',
        },

    ],
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            
            },
        });
    },
    handleEvents: function(){
       
        const cdWidth = cd.offsetWidth;
        // Xử lí CD rotate
        const cdThumbAnimate = cdThumb.animate([
        {
            transform: 'rotate(360deg)'
        }],
        {   
            // Thời gian animation
            duration: 10000,
            // Số lần lặp
            iterations: Infinity, 
        })
        cdThumbAnimate.pause();
        // Xử lí phóng to thu nhỏ CD
        document.onscroll = function(event){
            const scrollTop = window.screenY || document.documentElement.scrollTop

            const newCdWidth = cdWidth - scrollTop ;
       
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px':0 ;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí click play
        playBtn.onclick = function(){
            if(app.isPlaying) {
                audio.pause(); 
            }
            else{
                audio.play();
            }
           
        }

        // Khi song được play 
        audio.onplay = function(){
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause 
        audio.onpause = function(){
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        // Khi tiến độ thay đổi

        audio.ontimeupdate = function(){
            if(audio.duration){
               const progressPercent = Math.floor(audio.currentTime/audio.duration * 100);
               progress.value = progressPercent;
            }
        }

        // Xử lí khi tua audio/video
        progress.onchange = function(e){
            const onTime = e.target.value * audio.duration/100;
            audio.currentTime = onTime;
        }
        // Khi next song 
        nextBtn.onclick = function(){
            if(app.isRandom) {
                app.randomSong();
            }
            else{
                app.nextSong();
            }
    
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        // Khi prev song
        prevBtn.onclick = function(){
            if(app.isRandom) {
                app.randomSong();
            }
            else{
                app.prevSong();
            }        
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        // Xử lí bật tắt random song
        randomBtn.onclick = function(e){
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active',app.isRandom);
        }
        // Lặp lại bài hát
        repeatBtn.onclick = function(e){
            app.isRepeat =!app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            
            repeatBtn.classList.toggle('active',app.isRepeat);
        }
        // Xử lí khi end song
        audio.onended = function(){
            if(app.isRepeat){
                audio.play();
            }else{
                nextBtn.onclick();
            }
        }
        // Xử lí khi chọn bài hát
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');

            // Khi click vào soong
            if(songNode || e.target.closest('.option')){
                if(songNode){
                    app.currentIndex = Number(songNode.getAttribute('data-index')); // Có thể dùng songNode.dataset.index cho attribute có tên data

                    app.loadCurrentSong();
                    app.render();
                    audio.play();
                }
                if(e.target.closest('.option')){
                    
                }
            }
        } 

    },
    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block:'center',
                
            });
        },300)
    },
    loadCurrentSong: function(){

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = 'url(' + this.currentSong.image + ')';
        audio.src = this.currentSong.path;
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex>=this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1;;
        }
        this.loadCurrentSong();
    },
    randomSong: function(){
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex )
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        randomBtn.classList.toggle('active',app.isRandom);
        repeatBtn.classList.toggle('active',app.isRepeat);
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Thuộc tính 
        this.defineProperties();
        // Lắng nghe xử lí các sự kiện DOM event
        this.handleEvents();
        // Tải bài vào ứng dụng

        this.loadCurrentSong();

        // render playlist
        this.render();
    },
    render: function () {
        const htmls = this.songs.map((song,index) => {
            return `
        <div class="song ${index === this.currentIndex ? 'active':''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`
        })
        playlist.innerHTML = htmls.join('');
    }
}

app.start();