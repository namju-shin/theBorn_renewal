$(function(){
    $('.main_menu').mouseenter(function(){
        // 메뉴 하나에 마우스를 올리면
        $('.subBackground').stop().slideDown();
        // subBackground를 slideDown 해다오
        $(this).find('.sub_menu').stop().slideDown();
        // $(this).find('.sub_menu>ul').style.display = 'block';
    })
    $('.main_menu').mouseleave(function(){
        $('.subBackground').stop().slideUp();
        $(this).find('.sub_menu').stop().slideUp();
    })


    



    // end
})

function selectBox(selected) {
    var boxA = document.getElementById('national');
    var boxB = document.getElementById('foreign');

    var boxheader = document.getElementById('sub_header');

    if (selected === 'national') {
      boxA.classList.add('selected');
      boxA.classList.remove('not-selected');
      boxB.classList.add('not-selected');
      boxB.classList.remove('selected');
      boxheader.style.backgroundImage = "url(./img/sub_header_bg06.jpg";
      // boxheader.style.backgroundColor = "red"
    } else {
      boxB.classList.add('selected');
      boxB.classList.remove('not-selected');
      boxA.classList.add('not-selected');
      boxA.classList.remove('selected');
      boxheader.style.backgroundImage = "url(./img/sub_header_bg06-02.jpg";
      // boxheader.style.backgroundColor = "cyan"
    }

    
}

window.onload = function() {

  var boxA = document.getElementById('national');
  var boxB = document.getElementById('foreign');
  var boxheader = document.getElementById('sub_header');
  
  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get('selected');
  const element = document.getElementById(selectedId);
  console.log(element);
  if (element.id == "national") {
    boxA.classList.add('selected');
    boxA.classList.remove('not-selected');
    boxB.classList.add('not-selected');
    boxB.classList.remove('selected');
    boxheader.style.backgroundImage = "url(./img/sub_header_bg06.jpg";
    // boxheader.style.backgroundColor = "blue"
  } else {
    boxB.classList.add('selected');
    boxB.classList.remove('not-selected');
    boxA.classList.add('not-selected');
    boxA.classList.remove('selected');
    boxheader.style.backgroundImage = "url(./img/sub_header_bg06-02.jpg";
    // boxheader.style.backgroundColor = "yellow"
  }
}

// 🚀 선택된 매장을 저장할 변수
let selectedStoreElement = null;
let selectedMarker = null;

// 🚀 배경 + 브랜드 로고 합성하여 마커 생성
function createCustomMarker(bgImage, brandImage, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const bg = new Image();
    const brand = new Image();

    bg.crossOrigin = "anonymous";
    brand.crossOrigin = "anonymous";

    bg.src = bgImage;
    brand.src = brandImage;

    bg.onload = function () {
        canvas.width = bg.width;
        canvas.height = bg.height;

        // 배경 이미지 먼저 그리기
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        brand.onload = function () {
            // 브랜드 로고를 배경 중앙에 배치
            const brandSize = canvas.width * 0.5; // 배경 크기의 50%로 설정
            const x = (canvas.width - brandSize) / 2;
            const y = (canvas.height - brandSize) / 2 - 20;
            ctx.drawImage(brand, x, y, brandSize, brandSize);

            // 이미지 합성 후 Base64 URL로 변환
            callback(canvas.toDataURL());
        };
    };
}



let storeNameEl = document.getElementById("store-name");
let storeAddressEl = document.getElementById("store-address");
let storePhoneEl = document.getElementById("store-phone");

if (storeNameEl && storeAddressEl && storePhoneEl) {
    storeNameEl.innerText = store.name;
    storeAddressEl.innerText = `주소: ${store.address}`;
    storePhoneEl.innerText = `전화번호: ${store.phone}`;
} else {
    console.error("매장 정보를 표시할 요소를 찾을 수 없습니다.");
}


async function fetchLocations() {
    try {
        const response = await fetch("https://namju-shin.github.io/theBorn_renewal/js/stores.json"); // ✅ 정확한 경로로 수정
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        return [];
    }
}

async function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: { lat: 37.7251873, lng: 126.7556171 }
    });

    console.log("✅ Google 지도 초기화 완료");

    const locations = await fetchLocations();
    console.log("✅ 불러온 매장 개수:", locations.length);

    locations.forEach(function (store) {
        console.log(`✅ 마커 추가 중: ${store.name}, 위치: (${store.latitude}, ${store.longitude})`);

        // 🚀 `bg_image + brand_image`를 합성하여 마커 생성
        createCustomMarker(store.bg_image, store.brand_image, function (mergedImage) {
            var marker = new google.maps.Marker({
                position: { lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) },
                map: map,
                icon: {
                    url: mergedImage, // 🎯 합성된 이미지 사용!
                    scaledSize: new google.maps.Size(60, 60)
                },
                title: store.name
            });

            // 📌 마커 클릭 시 이벤트 처리
            marker.addListener("click", function () {
                // 1️⃣ 이전에 선택된 매장의 h3 색상 원래대로 복구
                if (selectedStoreElement) {
                    selectedStoreElement.querySelector("h3").style.color = "";
                }

                // 2️⃣ 현재 선택된 매장의 h3 색상을 변경
                var storeElement = document.getElementById(store.id);
                if (storeElement) {
                    storeElement.querySelector("h3").style.color = "var(--main_color)";
                    selectedStoreElement = storeElement; // 선택된 매장 업데이트
                }

                // 3️⃣ 이전 마커를 원래 상태로 되돌림
                if (selectedMarker) {
                    createCustomMarker(selectedMarker.store.bg, selectedMarker.store.brand, function (resetImage) {
                        selectedMarker.marker.setIcon({
                            url: resetImage,
                            scaledSize: new google.maps.Size(60, 60)
                        });
                    });
                }

                // 4️⃣ 현재 선택된 마커에 테두리 추가
                createCustomMarker(store.bg, store.brand, function (selectedImage) {
                    marker.setIcon({
                        url: selectedImage,
                        scaledSize: new google.maps.Size(60, 60)
                    });
                }, true);

                // 선택된 마커 업데이트
                selectedMarker = { marker, store };

                // 5️⃣ 지도 이동
                map.setCenter(marker.getPosition());
                map.setZoom(15);
            });
        });
    });
}



document.addEventListener("DOMContentLoaded", function () {
    initMap();
});

