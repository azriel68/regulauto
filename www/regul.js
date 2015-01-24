/*
This file is part of Regulauto.

    Regulauto is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Regulauto is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>
  
    Author azriel68@gmail.com
 */


var TSpeciale=[];
var regul = {}; // create fucking object !
var distanceCadenceur = 0;
var distanceCadenceurTick = 0; 
var moyenneCadenceur = 0;
var my_tick_sound={};  

function startRegul() {
	
    my_tick_sound = new Media('/android_asset/www/audio/beep.mp3');

    
    MyIndexedDB.open("regul", function() {
    	MyIndexedDB.getAll('speciale', TSpeciale, refreshListeSpeciale);
    });
  
 	$('#config').page({
		create:function(event,ui) {
			if(localStorage.interface_url) {  $('#interface_url').val(localStorage.interface_url); }
		}
	});
	
    for(i=0;i<24;i++) {
    	$('select.hour').append('<option value="'+i+'">'+pad_with_zeroes(i,2)+'h</option>');
    }  
    for(i=0;i<60;i++) {
    	$('select.minute').append('<option value="'+i+'">'+pad_with_zeroes(i,2)+'m</option>');
    	$('select.seconde').append('<option value="'+i+'">'+pad_with_zeroes(i,2)+'s</option>');
    }  
      
    $("#pointage_distance_km").change(function() {
    	$("#pointage_distance").val( $(this).val() * 1000 );
    	$("#pointage_distance").change();
    });
      
    $("#pointage_km_parcouru_km").change(function() {
    	$("#pointage_km_parcouru").val( $(this).val() * 1000 );
    	$("#pointage_km_parcouru").change();
    });
      
    $("#pointage_km_parcouru").change(function() {
    	
    	var m = $('input[name=pointage_distance]').val();

		var t = getTemps('pointage_temps'); 
    	   
		var km = $(this).val();
		
		var coef = km / m;

		var tDepart = getTemps('pointage_depart');

    	var dCur = new Date();
    	
    	var dStart = new Date(dCur.getFullYear(),dCur.getMonth(), dCur.getDate() , 0, 0, 0, 0 );
    	dStart = addMinutes(dStart, tDepart);
    	
		if( $("#pointage_demain").is(":checked") )dStart.setDate(dStart.getDate()+1);
		var dEnd = addMinutes(dStart, t);
		
		var dRest = new Date(dEnd.getTime() - dCur.getTime());
    	
		var dTarget = addMinutes( dStart, t * coef );    	
		var dDiffTarget = dCur.getTime() - dTarget.getTime();
    	
    	diff = dateDiff(dTarget,dCur);
		
		if(diff.min>0) {
			$('#pointage_etat_ar').html(diff.min+'min '+ diff.sec+'sec');
			$('#pointage_etat_ar').css({
				color:'red'
			});	
		}
		else{
			$('#pointage_etat_ar').html(diff.min+'min '+ Math.abs(diff.sec)+'sec');

			$('#pointage_etat_ar').css({
				color:'green'
			});	

		}
				    	
    }) ; 
      
    $("#etalonnage input[name=indice], #etalonnage input[name=zone], #etalonnage input[name=mesure]").change(function() {
    	
    	var i = $('#etalonnage input[name=indice]').val();
    	var z = $('#etalonnage input[name=zone]').val();
    	var m = $('#etalonnage input[name=mesure]').val();
   		
   		var coef = z / m;
   		
   		res = Math.round( i * coef * 100 ) / 100;
   		
   		$("#etalonnage_indice").html("Indice "+res); 	
    	
    }) ;
      
    $("#moyenne select.hour,#moyenne select.minute,#moyenne select.seconde").change(function(){
    	var t = parseInt($('select[name=moyenne_heure_temps]').val() * 60) + parseInt($('select[name=moyenne_minute_temps]').val()) + parseFloat($('select[name=moyenne_seconde_temps]').val() / 60) ;
    	var d = $('input[name=moyenne_distance]').val();
    	var m = $('input[name=moyenne_moyenne]').val();
    	
    	
    	
    });
      
     $('input[name=pointage_depart],#pointage select.hour,#pointage select.minute,#pointage select.seconde,input[name=pointage_temps],input[name=pointage_distance],#pointage_demain').change(function() {
    	
    	
    	var m = $('input[name=pointage_distance]').val();
    	$("#pointage_distance_km").val( m / 1000 );
    	
		var t = getTemps('pointage_temps'); 
    	
    	var tDepart = getTemps('pointage_depart');
    	
    	var dCur = new Date();
    	
    	var dStart = new Date(dCur.getFullYear(),dCur.getMonth(), dCur.getDate() , 0, 0, 0, 0 );
    	dStart = addMinutes(dStart, tDepart);
    	
    	if( $("#pointage_demain").is(":checked") )dStart.setDate(dStart.getDate()+1);
		var dEnd = addMinutes(dStart, t);
		
		var moyenne = getMoyenne(m, t);
    	
    	var dRest = new Date(dEnd.getTime() - dCur.getTime());
    	
    	$('#pointage_temps_restant,#pointage_temps_restant2').countdown('destroy');
    	$('#pointage_temps_restant').countdown({
    		until: dStart
    		, compact: true
    		, description: ' avant le départ'
    	});
    	
    	$('#pointage_temps_restant2').countdown({
    		until: dEnd
    		, compact: true
    		, description: ' avant arrivée'
    	});
    	
    	$('#pointage_moyenne').html('Moyenne '+moyenne+'km/h');
    	$('#pointage_heure_arrivee,#pointage_heure_arrivee2').html("Arrivée "+dEnd.toString().substr(16,8) );
		
	
    	
    });  
    
    $('input[name=delete-speciale]').click(function() {
    	
    	if(window.confirm("Attention, vous allez supprimer cette spéciale, etes-vous sûr ?")) {
    		 var id = $("#speciale").attr('itemid');
    		
    		 $('ul#listeSpeciale li.speciale[itemid='+id+']').remove();
    		 MyIndexedDB.deleteItem('speciale', id);
    		 $.mobile.changePage('#home');
    	}
    	
    });
     
    $('input[name=add-etape]').click(function(){
    	
    	MyIndexedDB.getItem( 'speciale', id, addEtape );
    	
    });
    
    $('input[name=add-speciale]').click(function(){
    	var newId = MyIndexedDB.getNewId('speciale');
    	
    	item={
    		id:MyIndexedDB.getNewId('speciale')
    		,label:$('input[name=new-speciale-name]').val()
    		,TCadence:[]
    	};
    	
    	if(item.label=='') {
    		window.alert('Attention, le nom est vide');
    		
    	}
    	else{
	    	TSpeciale.push(item);
	    	
	    	MyIndexedDB.addItem('speciale', item, refreshListeSpeciale);
    		
    	}
    	
    });
      
    $('#cadenceur input[name=start-etape]').click(function() {
    	$('#cadenceur div[rel=time]').countdown('resume');
    });
     
    $('#cadenceur input[name=next-etape]').click(function() {
    	setCadence($('#cadenceur').attr('itemid'), parseInt( $('#cadenceur').attr('cadenceid') ) +1, true);
    });
     
     
}
function soundPlay() {
/*	var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3");
  	myMedia.play({ numberOfLoops: 2 });*/
	
	my_tick_sound.play();

}

function addEtape(item) {
	
	var etape={
		moyenne:$('#speciale input[name=moyenne]').val()
		,distance:$('#speciale input[name=zone]').val()
	};
	
	item.TCadence.push(etape);
	
	MyIndexedDB.addItem('speciale',item,refreshListeCadence);
	
	
}

function getTemps(inputName) {
	
	if($('input[name='+inputName+']').length>0) {
		var temps = $('input[name='+inputName+']').val();
		var TTemps  = temps.split(":");
		if(TTemps.length<3)TTemps[2] = 0;
	
		var t = parseInt(TTemps[0] ) * 60 + parseInt(TTemps[1]) + parseInt(TTemps[2])/ 60 ;
		
	}
	else{
		var t = parseInt($('select[name='+inputName+'_heure]').val() * 60) + parseInt($('select[name='+inputName+'_minute]').val()) + parseFloat($('select[name='+inputName+'_seconde]').val() / 60) ;
	}	
	
	return t;	
}
function refreshListeSpeciale() {
	
	$('ul#listeSpeciale li.speciale').remove();
	$.each(TSpeciale,function(i, item) {
		$('ul#listeSpeciale').prepend('<li class="speciale" itemid="'+item.id+'"><a  href="#speciale" itemid="'+item.id+'">'+item.label+'</a></li>');	
	});
	
	if ($('ul#listeSpeciale').hasClass('ui-listview')) {
		    $('ul#listeSpeciale').listview('refresh');
	} else {
	    $('ul#listeSpeciale').listview();
	}
	
	$('ul#listeSpeciale li.speciale a').click(function() {
		
		id = $(this).attr('itemid');
		
		$('#speciale').attr('itemid', id);
		
		MyIndexedDB.getItem( 'speciale', id, refreshListeCadence );
		
		
	});
	
}
function refreshListeCadence(item) {
	
	$('#speciale #speciale-name').html(item.label);
	
	var $ul = $('ul#cadence-list');
	
	$ul.find('li.cadence').remove();
	$.each(item.TCadence,function(i, cadence) {
		$ul.append('<li class="cadence" cadenceid="'+i+'" data-icon="delete"><a class="cadence" href="#cadenceur" itemid="'+item.id+'" cadenceid="'+i+'">'+cadence.moyenne+'k/m sur '+(cadence.distance/1000)+'km</a><a class="delete" href="#" itemid="'+item.id+'" cadenceid="'+i+'">Supprimer</a></li>');	
	});
	
	if ($ul.hasClass('ui-listview')) {
		    $ul.listview('refresh');
	} else {
	    $ul.listview();
	}
	
	$ul.find('li.cadence a.cadence').click(function() {
		itemid = $(this).attr('itemid');
		cadenceid=$(this).attr('cadenceid');
		
		$('#cadenceur').attr('itemid', itemid);
		$('#cadenceur').attr('cadenceid', cadenceid);
		
		setCadence(itemid, cadenceid);
	});
	
	$ul.find('li.cadence a.delete').click(function() {
		
		itemid = $(this).attr('itemid');
		cadenceid = $(this).attr('cadenceid');
		
		if(window.confirm("Supprimer cette cadence ?")) {
			
			MyIndexedDB.getItem('speciale', itemid, function(item) {
				item.TCadence.splice(cadenceid,1);
				
				MyIndexedDB.addItem('speciale', item, refreshListeCadence(item));
			});
			
		}
		
	});
	
}

function setCadence(itemid, cadenceid, noblockcounter) {
	
	MyIndexedDB.getItem('speciale', itemid, function(item) {
			cadence = item.TCadence[cadenceid];
			
			if(! (cadenceid+1) in item.TCadence){
				$('#cadenceur input[name=next-etape]').hide();
			}
			
			$('#cadenceur div[rel=vitesse]').html(cadence.moyenne+'km/h');
			
			dStart = new Date();
			
			distanceCadenceur = 0;
			moyenneCadenceur = cadence.moyenne;
			
			$('#cadenceur div[rel=time]').countdown('destroy');
			
			$('#cadenceur div[rel=time]').countdown({
	    		since: dStart
	    		, compact: true
	    		, description: ''
	    		,onTick: updateDistance
    		});
    		
    		if(noblockcounter!=true) {
    			$('#cadenceur div[rel=time]').countdown('pause');	
    		}
    		
			
		});
		
}

function updateDistance(periods) {
	
	var sum = periods.reduce(function(pv, cv) { return pv + cv; }, 0);
	
	if(sum>0) {
		km_per_sec = moyenneCadenceur / 3600; 
		distanceCadenceur = distanceCadenceur+km_per_sec;
				
		$('#cadenceur div[rel=distance]').html((Math.round(distanceCadenceur*100) / 100)+"km");
		
		if(distanceCadenceur>=distanceCadenceurTick) {
			soundPlay();	
			distanceCadenceurTick+=.1;
		}
		
	}
	
}

function dateDiff(date1, date2){
    var diff = {};                           // Initialisation du retour
    var tmp = date2 - date1;
 
    tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60;                    // Extraction du nombre de secondes
 
    tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
    diff.min = tmp % 60;                    // Extraction du nombre de minutes
 
    tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
    diff.hour = tmp % 24;                   // Extraction du nombre d'heures
     
    tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
    diff.day = tmp;
     
    return diff;
}

function getMoyenne(distance, duree) {
	// distance en mètre, durée en minute
	
	km = distance / 1000;
	h = duree / 60;
	moy = km / h;
	
	return Math.round( moy * 100 ) / 100;
	
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function pad_with_zeroes(number, length) {

    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }

    return my_string;

}


function saveConfig() {
	
	localStorage.interface_url = $('#interface_url').val();	
	
	$.ajax({
			url:localStorage.interface_url
			
			,data : {
  				get:'check'
  				,jsonp: 1
  			}
  	,dataType:'jsonp'
  	,async : true
	}).done(function() { alert('Configuration saved !'); }).fail(function() { alert('Configuration saved... But i think it\'s wrong.'); });
	
	
}

function setItemInHTML($container, item) {
	
	for(x in item) {
		
		value = item[x];
		
		$container.find('[rel='+x+']').html(value);
		
	}
	
}

