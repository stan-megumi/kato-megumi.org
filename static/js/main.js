var img = new Image();
img.src ='static/picts/yuzi.png'
img.onload = function() {
    draw(this);
};

var ip="127.0.0.1";

//// encode vector
var encode;
var decode;
var multi=255;
var savedData;


function draw(img) {

    var xCord=0;
    var yCord=0;

    // target canvas
    
    var  tC= document.getElementById('target');
    var  tCtx = tC.getContext('2d');
    console.log("target canvas size:",tC.width, tC.height);
    tCtx.drawImage(img, xCord, yCord, tC.width, tC.height);
    img.style.display = 'none';
    var  tImgData = tCtx.getImageData(xCord, yCord, tC.width, tC.height);
    var  tData = tImgData.data;
    var  tLen=tData.length/4;

    savedData=tImgData.data.slice(); // will be substracted during decoding
    


    // watermark canvas
    
    var wmC = document.getElementById("watermark");
    var wmCtx = wmC.getContext("2d");
    wmCtx.font = "30px Arial";
    wmCtx.strokeText(ip,20,30);

    var wmImgData = wmCtx.getImageData(0, 0, wmC.width, wmC.height);
    var wmData = wmImgData.data;

    var wmLen=wmData.length/4;

    // encode watermark canvas
    encode=shuffle(wmLen);
    decode=invshuffle(encode);
    console.log("encode:,decode", encode,decode);
    //// 
    var eWmC = document.getElementById("encodeWatermark");
    var eWmCtx = eWmC.getContext("2d");
    var eWImgData=eWmCtx.createImageData(wmImgData);

    for (var j=0;j<wmLen;j++) {
	eWImgData.data[4*j+3]=wmData[4*encode[j]+3]/multi;
//	eWImgData.data[4*j+3]=wmData[4*j+3]; /// this will show the original image
    }
    console.log("encoded watermark",eWImgData.data);
    eWmCtx.putImageData(eWImgData, xCord, yCord);

    // if we get the eWImgData
    // decode watermark canvas

    var dWmC = document.getElementById("decodeWatermark");
    var dWmCtx = dWmC.getContext("2d");
    var dWImgData=dWmCtx.createImageData(eWImgData);

    // decode according to decode1 and decode2
    
    for (var j=0;j<wmLen;j++) {
	dWImgData.data[4*j+3]=eWImgData.data[4*decode[j]+3]*multi;
    }

    dWmCtx.putImageData(dWImgData, xCord, yCord);

    // watermarked picture:
    
    for (var j=0;j<wmLen;j++) {
	tImgData.data[4*j+3] =savedData[4*j+3] - wmData[4*encode[j]+3]/multi;
//	console.log(savedData[4*j+3]/multi,wmData[4*encode[j]+3]/multi);

	if (tImgData.data[4*j+3]!=savedData[4*j+3]) {console.log("noise!")}
    }

    tCtx.putImageData(tImgData, xCord, yCord);

    // if u get the encoded picture: tImgData
    // now decode watermarked picture

    var dcC = document.getElementById("decodetarget");
    var dcCtx = dcC.getContext("2d");
    var dcImgData=dWmCtx.createImageData(tImgData);
    var encodeAlpha1=[];
    // calc difference 
    for (var j=0;j<wmLen;j++) {
	dcImgData.data[4*j+3]=(savedData[4*j+3]-tImgData.data[4*j+3])*multi;
	if (dcImgData.data[4*j+3]>0) {console.log("decode >0");}
	encodeAlpha1.push(dcImgData.data[4*j+3]);
    }
    console.log(encodeAlpha1);
    // decode
    for (var j=0;j<wmLen;j++) {    
	dcImgData.data[4*j+3]=encodeAlpha1[decode[j]];
    }

    dcCtx.putImageData(dcImgData,xCord,yCord);

}


function shuffle(n) {
    var array=[];
    
    for (var i = 0; i < n; i++) {
	array.push(i);
    }
	
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	}
	return array;
}

function invshuffle(perm){
    var perm_inverse=new Array(perm.length);

    for (var i = 0; i < perm.length; i++) {
	perm_inverse[perm[i]] = i;
    }

    return perm_inverse;
}
