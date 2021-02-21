window.onload = function() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.onload = function() {
		loadfunctions();
	};
	(document.getElementsByTagName( "head" )[ 0 ]).appendChild( script );
	script.src = "/theme/jquery.js";
};

window.onunload = function() {};

var old_showHidePopupMenu = showHidePopupMenu;
showHidePopupMenu = function() {//extend original showHidePopupMenu function
	old_showHidePopupMenu.apply(this, arguments);
	setTimeout(function(){
		showHidePopupMenu_extended();
	},100);
};


function loadfunctions(){
	$(".cellcontainer").each(function(){//based on the original theme
		if($(this).find(".numberblock").length == 0){//is comic or is folder, only folder have an element with class "numberblock"
			var currentelement = this;
			var comicid = $(this).find("img").attr("src").split("/")[2];//the img contains the comics ID
			//check if you have started to read comic
			$.ajax({
				type: "GET",
				url: "/user-api/bookmark?isBook=false&docId="+comicid,
			}).done(function(data){
				if(data != undefined){//if defined then you have started
					var lastreadpage = parseInt(data.mark);//latest read page
					//this whole part would be easier and an extra AJAX would not be needed when "data.isFinished" starts to work, but the reader dont seem set that variable yet
					//get comic info, (page count is in the popup details)
					$.ajax({
						type: "GET",
						url: "/comicdetails/"+comicid,
					}).done(function(data){
						//temporary append element to body get data from #details -> #details_size
						$("body").append('<div id="temp_'+comicid+'">'+data+'</div>');
						var pages = parseInt($("#temp_"+comicid).find("#details_size").text().split(" ")[0]);//first part of #details_size contains the page count
						pages--;//last page dont get marked as read from the reader so reducing it by 1.
						$("#temp_"+comicid).remove();
						if(lastreadpage == pages){//is done?
							$('<span style="color:green;font-size:30px;position: relative;top: -300px;left: 70px;background-color: white;border: 1px solid black;padding: 2px;">&#10004;</span>').insertAfter($(currentelement).find(".label"));
						}
						else if(lastreadpage >= 1){//read further than page 1?
							$('<progress style="position: relative;top:-295px;" class="list_progress" max="'+pages+'" value="'+lastreadpage+'"></progress>').insertAfter($(currentelement).find(".label"));
						}
					});
				}
			});
		}
	});
}

function appendprogress(){
	//wait for ajax to fill comicdetails
	if($("#comicdetails").find("#details_size").length == 0){
		setTimeout(function(){
			appendprogress();
		},100);
		return;
	}
	var comicid = $("#comicdetails").find("#details_cover img").attr("src").split("/")[2];
	$.ajax({
		type: "GET",
		url: "/user-api/bookmark?isBook=false&docId="+comicid,
	}).done(function(data) {
		if (data != undefined) {//has bookmark data?
			var lastreadpage = parseInt(data.mark);
			if(lastreadpage > 0){//is started?
				lastreadpage++;//cover is 0
				var pages = parseInt($("#comicdetails").find("#details_size").text().split(" ")[0]);
				$("#details_size").text(function () {
					return $(this).text().replace("pages", "pages read.");
				});
				if(lastreadpage == pages){//is done?
					$('<span><span class="detail_finished">Finished!</span> All </span>').prependTo($("#comicdetails").find("#details_size"));
				}
				else if(lastreadpage >= 1){//read further than page 1?
					$('<span><progress class="detail_progress" max="'+pages+'" value="'+lastreadpage+'"></progress><br>'+lastreadpage+' pages of </span>').prependTo($("#comicdetails").find("#details_size"));
				}
			}
		}
	});


}

function showHidePopupMenu_extended(){//triggers if original showHidePopupMenu is called

	if($("#comicdetails").is(":visible")){//inject progress into #comicdetails
		appendprogress();
	}
	else{
		$("#comicdetails").html("");
	}
}
