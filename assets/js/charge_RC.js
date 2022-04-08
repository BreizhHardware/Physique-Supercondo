	var stage
	var cjs=createjs,canv

	var charge=true,t=0,Dt=1e-6,R,C,E=0,U0=E,x=0,y=0,Tau='\u03C4',joue=true,choix=0;
	var OMEGA='\u03a9'
	var tpas = 0.04,h = 1*tpas,Uc=0,Ur=0,xmax = 16,ymax = 5,mesure;
/////////
	
	function init(){
	canv = document.getElementById("testCanvas");
	canv.style.backgroundColor='#EBEBFD'
	canv.parentNode.style.backgroundColor=canv.style.backgroundColor;
	//dimensions du canvas
	canv.width=860,canv.height=600;
	//Bouton plein écran
	var btPE=new BoutonPleinEcran(canv,'#009').set({x:50,y:540})
	stage = new cjs.Stage(canv);
	stage.enableMouseOver();
	cjs.Touch.enable(stage)
	
	cjs.Ticker.framerate=25;
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	cjs.Ticker.on("tick", tick);
	function tick(evt) { action()}
	
	var txtEmploi="- Des boutons permettent de choisir entre la charge et la décharge du condensateur. En cliquant dessus, on réinitialise l'opération.\n- Le bouton stop/play  permet de figer l'animation.\n- Le bouton clear permet d'effacer les graphes.\n- Les curseurs permettent de modifier les valeurs des composants.\n- Un chronomètre permet de faire la mesure \"en temps réel\". Il se réinitialise automatiquement.\n- Un bargraph permet d'apprécier la charge du condensateur.\n- Un \"réservoir\" permet d'apprécier l'énergie du condensateur.\n- Des boutons de navigation permettent de passer d'une page à l'autre."
				
	var aide=new Aide(60,60,txtEmploi,450);
	aide.x=20;
	aide.y=20;
	
	var systeme=new cjs.Container().set({x:100,y:120})
	var systeme1=new cjs.Container(),systeme2=new cjs.Container(),systeme21=new cjs.Container(),systeme22=new cjs.Container()
	
	//systeme1
	//circuit
	var circuit=new cjs.Container().set({x:-30,y:-20})
	var circuit1=new cjs.Container().set({x:-30,y:-20})
	var cir=new cjs.Shape()
	cir.graphics.ss(2).s('#666')
	.mt(0,0).lt(40,0).mt(80,0).lt(300,0).lt(300,40).mt(300,120).lt(300,160).lt(0,160).lt(0,0).mt(80,160).lt(80,40).f('#666').dc(80,40,3).mt(40,0).dc(40,0,3).mt(80,0).dc(80,0,3)
	
	//générateur
	var gene=new cjs.Container().set({x:0,y:70})
	var sgen=new cjs.Shape()
sgen.graphics.ss(3).s('#099').mt(0,-40).lt(0,40).f('#099').f('#3FF').dc(0,0,15).ef()
	sgen.dessineVecteur(new cjs.Point(0,13),new cjs.Point(0,-10),8,3,'#099')
//	var txg1=new cjs.Text('5V','bold 16px Arial','#099').set({x:0,y:-8,textAlign:'center'})
	gene.addChild(sgen)
	
	//condensateur
	var cond=new cjs.Container().set({x:300,y:80,rotation:90})
	var condo=dessineC()
	var charges=new cjs.Container().set({x:300,y:80,rotation:90})
	var txtP=new cjs.Text('+\n+\n+\n+','bold 14px Arial','blue').set({x:-25,y:-30})
	var txtM=new cjs.Text('-\n-\n-\n-','bold 14px Arial','red').set({x:17,y:-30})
	charges.addChild(txtP,txtM)
	cond.addChild(condo)
	
	//résistance
	var res=dessineR().set({x:180,y:0})
	//interrupteur
	var inter=new cjs.Shape().set({x:80,rotation:90})
	inter.graphics.ss(2).s('#606').mt(0,0).lt(0,40)
	
	var uc=dessineTension('uC',50,'#F00').set({x:335,y:80,rotation:90})
	uc.tx.set({rotation:-90,x:-10,y:-15})
	var ur=dessineTension('uR',50,'#090').set({x:180,y:-30})
	var ue=dessineTension('E',-50,'#099').set({x:-25,y:70,rotation:-90})
	ue.tx.set({rotation:90,x:25,y:-15})
	
	//flèches d'intensité
	var fl1=dessineFleche('i','#000').set({x:120})
	fl1.tx.color='#009'
	var fl2=dessineFleche('i','#000').set({x:160,y:160,rotation:180})
	fl2.tx.set({color:'#009',x:-10,y:20,rotation:180});
	var fl3=dessineFleche('i','#000').set({x:300,y:30,rotation:90})
	fl3.tx.set({color:'#009',x:-10,y:-10,rotation:-90});
	circuit.addChild(cir,gene,cond,res,uc,ur,ue,fl1,fl2,fl3)
	
	circuit.cache(-20,-20,400,200)
	circuit1.addChild(inter,charges)
	
	//graphes
	var contGraph=new cjs.Container().set({x:0,y:320})
	var graph1=new cjs.Container()
	var ax1=dessineAxes(-20,340,100,-120,'t(s)','uC(V)','black')
	graph1.addChild(ax1)
	ax1.txx.color='#333'
	ax1.txy.set({color:'#F00',x:10,y:-120})
	ax1.addChild(new repereH('1','#000')).set({y:-20})
	ax1.addChild(new repereH('5','#000')).set({y:-100})
	ax1.addChild(new repereV('1','#000')).set({x:20})
	ax1.addChild(new cjs.Text('uR(V)','bold 12px Arial','#060').set({x:45,y:-120}))
	ax1.addChild(new cjs.Text('E','bold 12px Arial','#066').set({x:85,y:-120}))
	ax1.addChild(new cjs.Text('(V)','bold 14px Arial','#333').set({x:95,y:-122}))
	ax1.addChildAt(dessineGrille(0,16,-5,5,20,20,0x999999),0)
	ax1.cache(-20,-150,380,300)
	
	var repE=graph1.addChild(new repereH('63%E','#333')).set({y:-50})
	repE.trait.graphics.clear().sd([5,2,0]).s('#333').mt(0,0).lt(320,0)
	var rTau=new repereV('','#000')
	rTau.trait.graphics.clear().sd([5,2,0]).s('#333').mt(0,-100).lt(0,100)
	rTau.addChild(dessineTau('#009')).set({y:14,scaleX:0.7,scaleY:0.7})
	var gUc=new cjs.Shape(),gUr=new cjs.Shape(),gE=new cjs.Shape()
	graph1.addChild(rTau,gUc,gUr,gE)
	
	var graph2=new cjs.Container().set({x:400})
	var ax2=dessineAxes(-20,340,100,-120,'t(s)','i(mA)','black')
	graph2.addChild(ax2)
	ax2.txx.color='#333'
	ax2.txy.set({color:'#009',x:10,y:-120})
	ax2.addChild(new repereH('0.2','#000')).set({y:-20})
	ax2.addChild(new repereH('1','#000')).set({y:-100})
	ax2.addChild(new repereV('1','#000')).set({x:20})
	var a2=ax2.addChild(dessineAxeV(100,-120,'q(mC)','black').set({x:320}))
	a2.txy.color='#909'
	a2.addChild(new repereH('1','#000')).set({y:-20})
	ax2.addChildAt(dessineGrille(0,16,-5,5,20,20,0x999999),0)
	ax2.cache(-20,-150,380,300)
	
	var rTau2=new repereV('','#000')
	rTau2.addChild(dessineTau('#009')).set({y:14,scaleX:0.7,scaleY:0.7})
	var gI=new cjs.Shape(),gq=new cjs.Shape()
	//double-flèche
	var fleche=new cjs.Shape().set({x:50,y:-50})
	fleche.graphics.s('red').mt(-10,5).lt(-20,0).lt(-10,-5).mt(-20,0).lt(20,0).lt(10,-5).mt(20,0).lt(10,5).mt(0,0).f('red').dc(0,0,3)
	//affichage
	var affg=new cjs.Container().set({x:90,y:-130})
	affg.cursor='pointer'
	var fondafg=new cjs.Shape()
	fondafg.graphics.s('red').f('#FEE').dr(0,0,160,40)
	var txtag=new cjs.Text("le coefficient directeur de la\ntangente à la courbe q(t) est égal\nà  l'intensité algébrique i=dq/dt",'10px Arial','red').set({x:80,y:3,textAlign:'center'})
	affg.addChild(fondafg,txtag)
	dragAndDrop(affg)
	graph2.addChild(rTau2,gI,gq,fleche,affg)
	
	contGraph.addChild(graph1,graph2)
	
	//boutons
	var contBt=new cjs.Container().set({x:320,y:-40})
	var btCh=new Bouton('charge','#909',80)
	btCh.on('click',function(){charge=true;inter.rotation=90*charge;raz()})
	var btDech=new Bouton('décharge','#909',80).set({y:40})
	btDech.on('click',function(){charge=false;inter.rotation=90*charge;raz()})
	var btPlay=new BoutonRond('stop/play','#99F','#009',60).set({x:40,y:120})
	btPlay.on('click',function(){joue=!joue;chrono.chro=joue})
	var btClear=new BoutonRond('clear','#99F','#009',60).set({x:40,y:320})
	btClear.on('click',function(){t=0;x=0;initGraph()})
	
	contBt.addChild(btCh,btDech,btPlay,btClear)
	
	//curseurs
	var contCur=new cjs.Container().set({x:-50,y:180})
	var curR=new Curseur(1,10,100,5,'#090')
	curR.on('pressmove',affiche)
	var curC=new Curseur(100,1000,100,500,'#F00').set({x:120})
	curC.on('pressmove',affiche)
	var curE=new Curseur(0.05,5,100,4,'#066').set({x:240})
	curE.on('pressmove',affiche)
	contCur.addChild(curR,curC,curE)
	
	//chronomètre
	var chrono=new Chrono().set({x:320,y:130})
	chrono.joue=joue
	
	//énergie
	var NRJ=new cjs.Container().set({x:680,y:80})
	var pot=new cjs.Shape()
	pot.graphics.ss(2).s('#009').mt(-30,-110).lt(-30,0).lt(30,0).lt(30,-110)
	var niveau=new cjs.Shape()
	niveau.graphics.f('#09F').dr(-30,-150,60,150)
	var txen=new cjs.Text('énergie du\ncondensateur','14px Arial','#009').set({y:15,textAlign:'center'})
	NRJ.addChild(niveau,pot,txen)
	
	var bargraph=new cjs.Container().set({x:470,y:170})
	var sbar0=new cjs.Shape()
	sbar0.graphics.s('#00F').dr(0,-20,100,20)
	var sbar=new cjs.Shape().set({scaleX:0.5})
	sbar.graphics.f('#00F').dr(0,-20,100,20)
	var txbar=new cjs.Text('le condensateur se charge','12px Arial','#00F').set({x:-20,y:-35})
	var txbar1=new cjs.Text('%','12px Arial','#00F').set({x:110,y:-15})
	bargraph.addChild(sbar,sbar0,txbar,txbar1)
	
	//affichage
	var aff=new cjs.Container().set({x:520,y:0})
	
	var fondAf=new cjs.Shape()
	fondAf.graphics.ss(2).s('#009').f('#CFF').rr(-100,-50,200,160,5)
	fondAf.cache(-102,-52,204,164)
	var ta1="L'équation différentielle :\n\n\nLa solution :\n\n\n",ta2=Tau+" = R*C = ",ta3="1 s",ta4="Uo = "//modifier ta3
	var txAf1=new cjs.Text(ta1+ta2+ta3+ta4,'17px Arial','red').set({textAlign:'center',y:-40})
	
	var tb1="uC' + uC/"+Tau+" = ",tb2="E/"+Tau,tb21="0",tb3="\n\n\nuC = ",tb4="E*[1-exp(-t/"+Tau+")]\n\n\n",tb41="Uo*exp(-t/"+Tau+")\n\n\n";//choisir entre tb2 et tb21 et entre tb4 et tb41
	var txAf2=new cjs.Text(tb1+tb2+tb3+tb4,'bold 17px Arial','#009').set({textAlign:'center',y:-15})
	aff.addChild(fondAf,txAf1,txAf2)
	
	//titre
	var titre=new cjs.Text('Charge du condensateur','bold 18px Arial','#009').set({x:360,y:-100,textAlign:'center'})
	
	//menu
	var menu=new cjs.Container().set({x:425,y:550})
	var bt1=new BoutonMenu('#606','#909').set({x:-35,scaleX:-1})
	var bt2=new BoutonMenu('#606','#909').set({x:35})
	bt1.on('click',function(){choix--;choix=(choix+3)%3;choisit();raz()})
	bt2.on('click',function(){choix++;choix=(choix+3)%3;choisit();raz()})
	var txm1=new cjs.Text('précédent','14px Arial','#009').set({textAlign:'right',x:-80,y:-5})
	var txm2=new cjs.Text('suivant','14px Arial','#009').set({textAlign:'left',x:80,y:-5})
	menu.addChild(bt1,bt2,txm1,txm2)
	
/////////////////////::
//systeme2
//graphes
	var contGraph2=new cjs.Container().set({x:0,y:320})
	
	var graph12=new cjs.Container().set({y:-120})
	var ax12=dessineAxes(-20,500,170,-180,'t(s)','uC(V)','black')
	ax12.txx.color='#303'
	ax12.txy.set({color:'#F00',x:10,y:-180})
	ax12.addChild(new repereH('1','#000')).set({y:-30})
	ax12.addChild(new repereH('5','#000')).set({y:-150})
	ax12.addChild(new repereV('1','#000')).set({x:30})
	ax12.addChildAt(dessineGrille(0,32,-10,10,15,15,0x999999),0)
	ax12.cache(-20,-200,530,400)

	var rTau3=rTau2.clone(true)
	var gr=new cjs.Shape(),asymp=new cjs.Shape(),tg=new cjs.Shape(),tg1=new cjs.Shape(),rond=new cjs.Shape()
	rond.graphics.f('red').dc(0,0,4)
	var repE1=new repereH('E')
	repE1.trait.graphics.clear()
	repE1.txt.color='#099'
	graph12.addChild(ax12,gr)
	
	var graph22=new cjs.Container().set({x:0,y:200})
	graph22.addChild(asymp,tg,tg1,rTau3,rond,repE1)
	systeme21.addChild(graph22)

	contGraph2.addChild(graph12)
	
	//curseurs
	var contCur2=new cjs.Container().set({x:180,y:-20})
	var curR2=new Curseur(1,10,100,5,'#090')
	curR2.on('pressmove',affiche2)
	var curC2=new Curseur(100,1000,100,500,'#F00').set({x:120})
	curC2.on('pressmove',affiche2)
	var curE2=new Curseur(0.05,5,100,4,'#066').set({x:240})
	curE2.on('pressmove',affiche2)
	contCur2.addChild(curR2,curC2,curE2)
	
	//textes
	var contText2=new cjs.Container().set({x:540,y:40})
	var tx1=new cjs.Text("1- Placer l'asymptote",'bold 14px Arial','#08A')
	var tx2=new cjs.Text("2- Placer la tangente à l'origine",'bold 14px Arial','#93C').set({y:40,lineWidth:150})
	var tx3=new cjs.Text("3- Définir leur intersection",'bold 14px Arial','#F00').set({y:100,lineWidth:150})
	var tx4=new cjs.Text("4- L'abscisse du point d'intersection est "+Tau+" = "+""+" s",'bold 14px Arial','#00A').set({y:160,lineWidth:200})
	
	var btRec=new Bouton('recommencer','#909',100).set({x:30,y:240})
	btRec.on('click',raz2)
	
	contText2.addChild(tx1,tx2,tx3,tx4,btRec)
	
	
 //systeme3
 var contDroites=new cjs.Container().set({x:570,y:280})
 var D1=droite('#009'),D2=droite('#009').set({y:30}),D3=droite('#009').set({y:60})
	
	var txt22=new cjs.Text("Utiliser les segments ci-dessous en les saisissant avec la souris (cliquer sur une croix ou sur la ligne) pour faire la mesure de la constante de temps, et saisir le résultat dans le cadre rose ci-dessus.",'14px Arial','#009').set({x:-30,y:-150,lineWidth:200})
	contDroites.addChild(D1,D2,D3,txt22)
	
	var contBt2=new cjs.Container().set({x:170,y:10})
	var bt21=new Bouton('cacher/montrer les curseurs','#909',150)
	bt21.on('click',function(){contCur2.visible=!contCur2.visible})
	//var bt22=new Bouton('changer les valeurs','#909',150).set({x:200})
	var bt22=new Bouton('changer les valeurs','#909',150).set({x:275,y:10})
	bt22.on('click',function(){
		charge = Math.round(2*Math.random())%2==0;
		curR.value = 1+9*Math.random()
		curC.value = 100*(1+9*Math.random())
		curE.value = 0.05*(1+100*Math.random())
		affiche()
		raz2()
		calcule2()
	})
	
	//texte de saisie
	var contReponse=new cjs.Container().set({x:545,y:30})
	systeme22.addChild(contDroites,contReponse)
	//P0 : position (fictive) du TextInput dans son container
	var P0=new cjs.Point(25,-8)
	var P=new cjs.Point(contReponse.x+systeme.x+P0.x,contReponse.y+systeme.y+P0.y)
	var TI=new TextInput().set({x:P.x,y:P.y});
	TI.placeHolder = "";
	TI.width=50;
	TI.height=25;
	TI.coBg='#FCC';TI.coTxt='#F00';TI.coTxt1='#F66'
	TI.update()
	stage.addChild(TI)
	var btRep=new Bouton('valider','#909',60).set({x:100,y:6})
	btRep.on('click',function(){
		mesure=Number(TI._preCursorText)
		ecart = Math.abs(tau-mesure);
	if (isNaN(Number(mesure))) {
		txr2.text = "saisir une valeur";
	} else {
		if (ecart<=0.1) {
			txr2.text = "bonne réponse";
		}
		if (ecart>0.1 && ecart<=0.3) {
			txr2.text = "réponse acceptable";
		} else if (ecart>0.3) {
			txr2.text = "vérifiez votre mesure";
		}
	}

		
		})
	var txr1=new cjs.Text(Tau+' =              s','16px Arial','red')
	var txr2=new cjs.Text('','bold 14px Arial','#F00').set({x:80,y:40,textAlign:'center'})
	contReponse.addChild(btRep,txr1,txr2)
	
	contBt2.addChild(bt21)
	
	
	systeme2.addChild(bt22)
	//signature
	var signature=signer('04/2020','#009').set({x:800,y:550})
	
	systeme1.addChild(circuit,circuit1,contGraph,NRJ,bargraph,contBt,contCur,chrono,aff,titre)
	systeme2.addChild(contGraph2,contText2)
	systeme21.addChild(contText2,contCur2)
	systeme.addChild(titre,systeme1,systeme2)
	
	stage.addChild(menu,systeme,signature,aide,btPE)
	choisit()
	affiche()
	raz()
	initGraph()
	stage.update()
	
	function choisit(){
		systeme.removeChild(systeme1)
		systeme.removeChild(systeme2)
		bt1.visible=true
		TI.visible=false
		switch(choix){
			case 0:
			titre.text='Charge du condensateur'
			bt1.visible=false
			systeme.addChild(systeme1)
			action=calcule1
			txm1.text=''
			txm2.text='suite : comment déterminer\nla constante de temps'
			break
			case 1:
			titre.text='Comment déterminer la constante de temps ?'
			systeme.addChild(systeme2)
			systeme2.removeChild(systeme22)
			systeme2.addChild(systeme21)
			action=calcule2
			txm1.text='retour au circuit'
			txm2.text='pour s\'entrainer...'
			raz2()
			break
			case 2:
			TI.visible=true
			titre.text='A vous !'
			systeme.addChild(systeme2)
			systeme2.removeChild(systeme21)
			systeme2.addChild(systeme22)
			action=calcule3
			txm1.text='comment déterminer la \nconstante de temps'
			txm2.text='retour au circuit'
		}
		stage.update()	
			
	}
	
	function calcule3(){
	//test.rep.onChanged = function() {
//		txtrep.text = "";
//	};
		
		stage.update()
	}
	
	function calcule2(){
	tau = R*C;
	
//	tx4.val.text = " = "+0.1*Math.round(10*tau)+" s";
	with (asymp) {
		graphics.clear();
		graphics.ss(2).s('#08A').mt(0, -E*charge*30).lt(480, -E*charge*30);
	}
	if (charge) {
		U0=0
		curE2.txt.text = "E = "+E.toFixed(2)+" V";
		repE1.txt.text = "E";
		repE1.y = -E*30;
		xI = tau;
		yI = E;
		if (E/tau>ymax/xmax) {
			xF = ymax*tau/E;
			yF = ymax;
		} else {
			xF = xmax;
			yF = xmax*E/tau;
		}
		with (gr) {
			graphics.clear();
			graphics.ss(2).s('red');
		}
		with (tg) {
			graphics.clear();
			graphics.ss(2).s('#93C');
			graphics.moveTo(0, -U0*30);
			graphics.lineTo(xF*30, -yF*30);
		}
		with (tg1) {
			graphics.clear();
			graphics.ss(2).s('#00A').mt((tau)*30, -E*30).lt((tau)*30, 0);
		}
	} 
	else {
		curE2.txt.text = "Uo = "+E.toFixed(2)+" V";
		repE1.txt.text = "Uo";
		repE1.y = -E*30;
		xI = tau;
		yI = 0;
		xF = tau;
		yF = 0;
		with (tg) {
			graphics.clear();
			graphics.ss(2).s('#93C').mt(0, -E*30).lt(xF*30, -yF*30);
		}
		with (tg1) {
			graphics.clear();
		}
		with (gr) {
			graphics.clear();
			graphics.ss(2).s('#F00').mt(0, -E*30);
		}
	}
	rond.x = xI*30;
	rond.y = -yI*30;
	rTau3.x = tau*30;
	for (var t = 0; t<16; t += 0.1) {
		if (charge) {
			var Uc = E*(1-Math.exp(-t/tau));
		} else {
			var Uc = E*Math.exp(-t/tau);
		}
		gr.graphics.lineTo(t*30, -Uc*30);
	}
	stage.update()
		
	}
	
	function calcule1(){
			if (charge) {
		titre.text = "Charge du condensateur";
	} else {
		titre.text = "Décharge du condensateur";
	}
	tau = R*C;
	if (joue) {
		//if (t<16) {
		t += h;
		dUc = -h*(Uc-E*charge)/tau;
		Uc += dUc;
		Ur = E*charge-Uc;
		I = Ur/R;
		//charge du condensateur
		Q = C*Uc;
		//énergie du condensateur
		Ec = 0.5*C*Uc*Uc;
		//taux de charge
		taux = Uc/E;
		charges.alpha=taux
//		circuit.q1._alpha = circuit.q2._alpha=100*taux;
		if (t<16) {
			gUr.graphics.lt(t*20, -Ur*20);
			//tracé de Ugéné
			gE.graphics.lt(t*20, -E*20);
			//tracé de Uc
			gUc.graphics.lt(t*20, -Uc*20);
			rTau.x = tau*20;
			rTau2.x = tau*20;

			gI.graphics.lt(t*20, -I*1e5);
			gq.graphics.lt(t*20, -Q*2e4);
			fleche.x = t*20;
			fleche.y = -Q*2e4;
			fleche.rotation = -Math.atan(I*1000)*180/Math.PI;
//			graph1.tau._x = tau*20;
		}
		//charge du condensateur                                           
			txbar1.text =(100*taux).toFixed(0)+"%";
			sbar.scaleX = taux;
			if (taux<0.05) {
				txbar.text = "le condensateur est déchargé";
			}
			if (taux>0.05 && taux<0.95) {
				if (charge) {
					txbar.text = "le condensateur se charge";
				} else {
					txbar.text = "le condensateur se décharge";
				}
			}
			if (taux>0.95) {
				txbar.text = "le condensateur est chargé";
			}
		//remplissage du réservoir d'énergie
			niveau.scaleY = Ec*1e2;
			
		if (charge) {
			repE.y = -E*20*0.63;
			repE.txt.text = "63% E";
		} else {
			repE.y = -Uc0*20*0.37;
			repE.txt.text = "37% E";
		}
//		aff.valtau.txttau.text = " = RxC = "+tau+" s";
//		aff.txU0.text = "Uo : "+0.1*Math.round(Uc0*10)+" V";
//		//txtcharge.text = "charge : "+Math.round(taux*100)+"%";
//		//valtau.txtU0.text = "Uco : "+0.1*Math.round(Uc0*10)+" V";
	}



		stage.update()
	}
	function raz(){
		chrono.demarre()
		tau = R*C;
		Uc = E*(!charge);
		Uc0 = Uc;
		Ur = E*charge-Uc;
		t = 0;
		t0 = t;
		initGraph()
		gUr.graphics.mt(0, -Ur*20);
		gE.graphics.mt(0, -E*20);
		gUc.graphics.mt(0, -Uc*20);
		gq.graphics.mt(0, -Uc*C*2e4);
		gI.graphics.mt(0, -Ur/R*1e5);
		joue = true;
		ta3=(R*C).toFixed(2)+" s"
		ta4="Uo = "+E.toFixed(2)+" V"
		if(charge){
			txAf1.text=ta1+ta2+ta3
			txAf2.text=tb1+tb2+tb3+tb4
		}
		else{
			txAf1.text=ta1+ta2+ta3
			txAf2.text=tb1+tb21+tb3+tb41+ta4
		}
	}
	function raz2(){
	contCur2.visible=true
	var dur=400,coef=50
	apparait(rTau3,400*coef, 1*coef);
	apparait(tx1,10*coef,dur);
	apparait(tx2,100*coef,dur);
	apparait(tx3,200*coef,dur);
	apparait(tx4,300*coef,dur);
	//apparait(txtU, 100*coef,dur);
//	apparait(txtE,10*coef, dur);
	apparait(tg1,350*coef,dur);
	
	clignote(asymp,0, 100*coef,300);
	clignote(tg,100*coef, 200*coef,300);
	clignote(rond,200*coef, 300*coef,300);
	clignote(tg1,300*coef, 400*coef,300);
	
	}
	
	function initGraph(){
		gUr.graphics.clear()
		gUr.graphics.ss(2).s('#090')
		gUc.graphics.clear()
		gUc.graphics.ss(2).s('#F00')
		gE.graphics.clear()
		gE.graphics.ss(2).s('#099')
		gI.graphics.clear()
		gI.graphics.ss(2).s('#009')
		gq.graphics.clear()
		gq.graphics.ss(2).s('#606')
		
	}
	function affiche(){
		R=curR.value*1e3;curR.txt.text='R = '+curR.value.toFixed(2)+' k'+OMEGA;curR2.txt.text=curR.txt.text;
		C=curC.value*1e-6;curC.txt.text='C = '+curC.value.toFixed(0)+' µF';curC2.txt.text=curC.txt.text;
		E=curE.value;curE.txt.text='E = '+curE.value.toFixed(2)+' V';curE2.txt.text=curE.txt.text;
		U0=E;
		curR2.value=curR.value
		curC2.value=curC.value
		curE2.value=curE.value
		tau=R*C
		ta3=(R*C).toFixed(2)+" s"
		tx4.text="4- L'abscisse du point d'intersection est "+Tau+" = "+tau.toFixed(2)+" s"
		if(charge){
			txAf1.text=ta1+ta2+ta3
			txAf2.text=tb1+tb2+tb3+tb4
			curE2.txt.text='E = '+curE2.value.toFixed(2)+' V'
		}
		else{
			txAf1.text=ta1+ta2+ta3
			txAf2.text=tb1+tb21+tb3+tb41
			curE2.txt.text='Uo = '+curE2.value.toFixed(2)+' V'
			
		}
		stage.update()
	}
	function affiche2(){
		curR.value=curR2.value
		curC.value=curC2.value
		curE.value=curE2.value
		affiche()
	}

}
//////////////

function droite(co){
	var cont=new cjs.Container()
	var croix=new cjs.Container()
	var c0=new cjs.Shape()
	c0.graphics.ss(2).s(co).mt(-5,0).lt(5,0).mt(0,-5).lt(0,5)
	croix.addChild(c0)
	var hit=new cjs.Shape()
	hit.graphics.f('red').dc(0,0,8)
	croix.hitArea=hit
	var croix1=croix.clone(true).set({x:140})
	croix.show=croix.addChild(rondClignotant(co).set({visible:false}))
	croix1.show=croix1.addChild(rondClignotant(co).set({visible:false}))
	croix.on('mouseover',function(){this.show.visible=true})	 
	croix.on('mouseout',function(){this.show.visible=false})
	croix1.on('mouseover',function(){this.show.visible=true})	 
	croix1.on('mouseout',function(){this.show.visible=false})		
	var ligne=new cjs.Shape()
	var hit1=new cjs.Shape()
	ligne.hitArea=hit1
	dessineLigne()
	function dessineLigne(){
		ligne.graphics.clear()
		ligne.graphics.ss(2).s(co).mt(croix.x,croix.y).lt(croix1.x,croix1.y)
		hit1.graphics.clear()
		hit1.graphics.ss(10).s('red').mt(croix.x,croix.y).lt(croix1.x,croix1.y)
	}
	cont.cursor='pointer'
	
	cont.addChild(ligne,croix,croix1)
	dragAndDrop(croix);
	dragAndDrop(croix1);
	dragAndDrop1(ligne)
	croix.on('pressmove',function(){
		dessineLigne()
	})
	croix1.on('pressmove',function(){
		dessineLigne()
	})
	stage.update()
	return cont
}
function rondClignotant(co){
	var show=new createjs.Shape().set({visible:true});
		show.graphics.ss(2).s(co).dc(0,0,8);
		createjs.Tween.get(show, {loop: true})
          .to({alpha: 0}, 200)
          .to({alpha: 1}, 200)
	return show
	
}

function apparait(ob,t0,duree){
	ob.alpha=0
	var tween=cjs.Tween.get(ob,{override:true})
	.wait(t0)
	.to({alpha:1},duree)
	return tween
}
function clignote(ob,tdeb,tfin,per){
	per=per||400
	var per1=per/2
	ob.alpha=0
	var loop=Math.round((tfin-tdeb)/per)
	var tween=cjs.Tween.get(ob,{override:true})
	.wait(tdeb)
	.call(suite)
	function suite(){
	tween=cjs.Tween.get(ob,{override:true,loop:loop})
	.to({alpha:0},per1)
	.to({alpha:1},per1)
	}
	return tween
}

function dessineTau(co){
	//lettre de 14 px de haut
	var st=new cjs.Shape();
	st.graphics.f(co).p("AgNhFQgQAAgIAHQgIAHgLAcIAFAAQAHgMAHgEQAHgEALAAIAOAAQgFAvAAAVQAAAbAIAKQAGALAMAAQALAAAIgJQAIgKADgYIgFAAQgCAKgFAFQgEAEgGAAQgIAAgFgHQgGgGAAgOQAAgSAFgvIAuAAIAAgWIhFAA").f();
	return st
}

function dessineR(){
	var sR=new cjs.Shape()
	sR.graphics.s("#006600").ss(3,1,1,3).p("AmPAAIMfAA").ss()
	.lf(["#006600","#6bfe6b","#0c6d0c"],[0,0.784,1],0,14,0,-13.9).p("AkXiLIAAEXIIwAAIAAkXIowAA").f();
	return sR
}
function dessineC(){
	var sC=new cjs.Shape()
	sC.graphics.f().s("#ff0000").ss(3,1,1,3).p("AB4AAIAADw").p("AB4AAIAAjv").p("AB4AAIEYAA").p("Ah3DwIAAjwQiJAAiPAA").p("Ah3AAIAAjv");
	return sC
}


function dessineTension(txt,lon,co){
	var cont=new cjs.Container()
	cont.s=new cjs.Shape()
	cont.s.dessineVecteur(new cjs.Point(lon/2,0),new cjs.Point(-lon/2,0),8,2,co)
	cont.tx=new cjs.Text(txt,'bold 14px Arial',co).set({y:-20,textAlign:'center'})
	cont.addChild(cont.s,cont.tx)
	return cont
}



cjs.Shape.prototype.dessineVecteur=function(debut, fin, fl, ep, co) {
	with (this.graphics) {
		var ang = Math.atan2(fin.y-debut.y, fin.x-debut.x);
		ss(ep).s(co).mt(debut.x, debut.y).lt(fin.x, fin.y).lt(fin.x+fl*Math.cos(ang+2.6),fin.y+fl*Math.sin(ang+2.6)).mt(fin.x,fin.y).lt(fin.x+fl*Math.cos(ang-2.6),fin.y+fl*Math.sin(ang-2.6));
	}
};

/////////////fonctions
function dessineGrille(minx,maxx,miny,maxy,pasx,pasy,col){
	var grille=new createjs.Shape()
	with(grille){
		alpha=1;
		graphics.beginStroke('#666');
		for (var j = miny; j<=maxy; j++) {
			graphics.ss(1).s(cjs.Graphics.getRGB(col,0.75));
			graphics.moveTo(pasx*minx, j*pasy);
			graphics.lineTo(pasx*maxx,j*pasy);
		}
		for (var l = minx; l<=maxx; l++) {
			graphics.ss(1).s(cjs.Graphics.getRGB(col,0.75));
			graphics.moveTo(l*pasx, pasy*miny);
			graphics.lineTo(l*pasx,pasy*maxy);
		}
	}
	return grille
}
function dessineAxes(minx,maxx,miny,maxy,tx,ty,co){
	var axes=new cjs.Container()
	var ax=new cjs.Shape(new cjs.Graphics().ss(1).s(co).mt(minx,0).lt(maxx,0).f(co).lt(maxx-10,-5).qt(maxx,0,maxx-10,5).lt(maxx,0).lt(maxx-10,-5).ef().mt(0,miny).lt(0,maxy).f(co).lt(-5,maxy+10).qt(0,maxy,5,maxy+10).lt(0,maxy).lt(-5,maxy+10).ef())
	ax.name='ax'
	var or=new cjs.Text('0','bold 14px Arial',co).set({x:-15,y:-0})
	axes.txx=new cjs.Text(tx,'bold 12px Arial',co).set({x:maxx-10,y:10})
	axes.txy=new cjs.Text(ty,'bold 12px Arial',co).set({x:15,y:maxy-15})
	axes.addChild(ax,or,axes.txx,axes.txy)
	return axes
}
function dessineAxeV(miny,maxy,ty,co){
	var axes=new cjs.Container()
	var ax=new cjs.Shape(new cjs.Graphics().ss(1).s(co).mt(0,miny).lt(0,maxy).f(co).lt(-5,maxy+10).qt(0,maxy,5,maxy+10).lt(0,maxy).lt(-5,maxy+10).ef())
	//var or=new cjs.Text('0','bold 14px Arial',co).set({x:-15,y:-0})
	axes.txy=new cjs.Text(ty,'bold 12px Arial',co).set({x:-40,y:maxy+0})
	axes.addChild(ax,axes.txy)
	return axes
}
function dessineFleche(tx,co){
	var fleche=new cjs.Container()
	var fl=new cjs.Shape(new cjs.Graphics().ss(1).s(co).mt(0,0).f(co).lt(-10,-5).qt(0,0,-10,5).lt(0,0).lt(-10,-5).ef())
	//var or=new cjs.Text('0','bold 14px Arial',co).set({x:-15,y:-0})
	fleche.tx=new cjs.Text(tx,'bold 14px Arial',co).set({x:-10,y:-20})
	fleche.addChild(fl,fleche.tx)
	return fleche
}
function repereH(txt,cou){
	var rep=new cjs.Container()
	rep.txt=rep.addChild(new cjs.Text(txt,'bold 12px Arial',cou).set({textAlign:'right',x:-10,y:-5}))
	rep.trait=rep.addChild(new cjs.Shape())
	rep.trait.graphics.s('#000').mt(-5,0).lt(5,0)
	return rep
}
function repereV(txt,cou){
	var rep=new cjs.Container()
	rep.txt=rep.addChild(new cjs.Text(txt,'bold 12px Arial',cou).set({textAlign:'center',x:0,y:10}))
	rep.trait=rep.addChild(new cjs.Shape())
	rep.trait.graphics.s('#000').mt(0,-5).lt(0,5)
	return rep
}
function dragAndDrop(obj){
	var pos0
	obj.on('mousedown',function(evt){pos0=new cjs.Point(evt.localX,evt.localY)})
	obj.on("pressmove", function(evt){
		var pos=(obj.parent.globalToLocal(evt.stageX-pos0.x,evt.stageY-pos0.y))
		obj.x=pos.x;obj.y=pos.y
		stage.update()
	});
}
function dragAndDrop1(obj){
	var pos0
	obj.on('mousedown',function(evt){pos0=new cjs.Point(evt.localX,evt.localY)})
	obj.on("pressmove", function(evt){
		var pos=(obj.parent.parent.globalToLocal(evt.stageX-pos0.x,evt.stageY-pos0.y))
		obj.parent.x=pos.x;obj.parent.y=pos.y
		stage.update()
	});
}
cjs.DisplayObject.prototype.pos = function(P) {
	this.x = P.x;
	this.y = P.y;
};


	function signer(date,cou){
			var sign = new createjs.Text('GT '+date, "bold 16px Arial",cou )
			sign.lineWidth=50
			sign.textAlign = "center";
			return sign
	}
	cjs.DisplayObject.prototype.aimante=function(){
		this.x=20*Math.round(this.x/20)
		this.y=20*Math.round(this.y/20)
	};
///R
(function() {

function R() {
	this.Container_constructor();
	this.setup();
	//this.name='ZR'
}
	var p = createjs.extend(R, createjs.Container);
	
	p.setup = function() {
	var sR=new cjs.Shape()
	sR.graphics.ss(3).s('#060').f('#060').dc(-50,0,3).dc(50,0,3).s(0).lf(["#060","#6F6","#060"], [0,0.3, 1], 0, -14, 0, 14).dr(-30, -14, 60, 28)	
	
	this.addChild(sR)
	}
window.R = createjs.promote(R, "Container");
//stage.update(); 
}());


//ZC
(function() {

function C() {
	this.Container_constructor();
	this.setup();
}
	var p = createjs.extend(C, createjs.Container);
	p.setup = function() {
	var sC=new cjs.Shape()
	sC.graphics.f('red').s('red').ss(2).dc(-40,0,3).lt(-12,0).mt(-12,-24).lt(-12,24).mt(12,-24).lt(12,24).mt(12,0).lt(40,0).dc(40,0,3)
	this.addChild(sC)
	
} ;
window.C = createjs.promote(C, "Container");
//stage.update(); 
}());


(function() {

function Curseur(min,max,lon,valeur,cou) {
	this.Container_constructor();
	
	this.min=min;
	this.max=max;
	this.lon=lon;
	this.valeur=valeur;
	this.cou=cou;
	
	this.coef=this.lon/(this.max-this.min)
	
	this.setup();
}
	var p = createjs.extend(Curseur, createjs.Container);
	p.setup = function() {
	var r=5,cx
	var txt = new createjs.Text('', "bold 14px Arial", this.cou);
	txt.textAlign = "center";
	txt.y = -25;
	txt.x=this.lon/2;
	this.txt=txt
	
	var ligne = new createjs.Shape();
	this.ligne=ligne
	ligne.graphics.beginStroke(this.cou).moveTo(0, 0).lineTo(this.lon, 0);
	
	var circle = new createjs.Shape();
	this.circle=circle
	circle.name='circle'
	circle.x=(this.valeur-this.min)*this.coef;
	circle.graphics.beginRadialGradientFill(["#FFF",this.cou], [0, 1], 3, 2, 0, 0, 0, r).drawCircle(0, 0, r);
	
	this.addChild(ligne, txt, circle);
	this.on("pressmove",function(evt) {
		if(evt.target.name=='circle'){
			cx=evt.localX
			cx=cx<0?0:cx
			cx=cx>this.lon?this.lon:cx
			evt.target.x = cx
			this.valeur=cx/this.coef+this.min;
		}
		stage.update();   
	})
	Object.defineProperty(this, "value", {
  get: function() { return this.circle.x/this.coef+this.min},
  set: function(y) { this.circle.x=this.coef*(y-this.min)}
})
	circle.cursor = "pointer";
	
} ;
window.Curseur = createjs.promote(Curseur, "Container");
//stage.update(); 
}());

//bouton de 20 pixels de haut, et de largeur par défaut 100 pixels, que l'on peut modifier
(function() {

function Button(label, color,width) {
	this.Container_constructor();
	this.color = color;
	this.label = label;
	this.width=width;
	this.setup();
}
var p = createjs.extend(Button, createjs.Container);


p.setup = function() {
	var text = new createjs.Text(this.label, "bold 14px Arial", "#FFF");
	this.text=text
	text.textBaseline = "top";
	text.textAlign = "center";
	width=(this.width==undefined?100:this.width)
	
	var height=20;
	
	text.x = width/2;
	text.y = -height*0.3;
	text.maxWidth=width-10
	
	var background = new createjs.Shape();
	this.background=background;
	//background.graphics.beginFill(this.color).drawRoundRect(0,0,width,height,10);
	background.graphics.setStrokeStyle(2).beginStroke(this.color).f(this.color).drawRoundRect(0,-height*0.5,width,height,5).ef().beginLinearGradientFill(["rgba(255,255,255,0.8",this.color], [0, 1], 0, -height*0.7, 0, height*0.5).drawRoundRect(0,-height*0.5,width,height,5);
	this.addChild(background, text); 
	this.on("click", this.handleClick);
	this.on("rollover", this.handleRollOver);
	this.on("rollout", this.handleRollOver);
	this.cursor = "pointer";

	this.mouseChildren = false;
} ;

p.handleClick = function (event) {
} ;

p.handleRollOver = function(event) {   
	this.background.scaleY=event.type == "rollover" ? -1 : 1;
	stage.update()
};

window.Bouton = createjs.promote(Button, "Container");
}());


//bouton menu
(function() {

function BoutonMenu(co,co1) {
	this.Container_constructor();
	this.co=co;
	this.co1=co1;
	this.setup();
}
var p = createjs.extend(BoutonMenu, createjs.Container);

p.setup = function() {
	var background = new createjs.Shape().set({alpha:0.8,visible:false});
	this.background=background;
	var r=20
	//background.graphics.beginFill(this.color).drawRoundRect(0,0,width,height,10);
	background.graphics.rf([this.co1,'white'], [0, 1], 0, 0, 0, 0, 0, r).dc(0,0,r);
	var sh=new cjs.Shape()
	sh.graphics.rf(['white',this.co1], [0, 1], 0, 0, 0, 0, 0, r).dc(0,0,r);
	var sh1=new cjs.Shape()
	sh1.graphics.ss(2).s(this.co).dc(0,0,r).f(this.co).dp(0,0,r*0.5,3)
	this.addChild(sh,background,sh1);
	this.on("rollover", this.onRollOver);
	this.on("rollout", this.onRollOver);
	//this.on("click", this.handleClick);
	//this.on("rollover", function(){this.background.visible=true});
//	this.on("rollout", function(){this.background.visible=false});
	this.cursor = "pointer";

	this.mouseChildren = false;
	
	//this.offset = Math.random()*10;
//	this.count = 0;
} ;
p.handleClick = function (event) {
} ;

p.onRollOver = function(event) {   
	this.background.visible=event.type == "rollover";
	stage.update()
};

window.BoutonMenu = createjs.promote(BoutonMenu, "Container");
}());

//bouton  ovale
(function() {

function BoutonRond(label, color1,color2,width) {
	this.Container_constructor();
	this.color1 = color1;
	this.color2=color2;
	this.label = label;
	this.width=width;
	this.setup();
}
var p = createjs.extend(BoutonRond, createjs.Container);


p.setup = function() {
	var text = new createjs.Text(this.label, "bold 14px Arial", "#FFF");
	this.text=text
	text.textBaseline = "top";
	text.textAlign = "center";
	width=(this.width==undefined?100:this.width)
	var height=this.width*0.7;
	text.y=-5
	var w=text.getMeasuredWidth();
	text.scaleX=w>width?width/w*0.9:1;
	
	var background = new createjs.Shape();
	this.background=background;
	//background.graphics.beginFill(this.color).drawRoundRect(0,0,width,height,10);
	background.graphics.rf([this.color1,this.color2], [0, 1], 8, 8, 0, 8, 8, this.width*0.5).de(-this.width*0.5, -height/2, this.width,height);
	this.addChild(background, text);
	this.on("click", this.handleClick);
	this.on("rollover", this.handleRollOver);
	this.on("rollout", this.handleRollOver);
	this.cursor = "pointer";

	this.mouseChildren = false;
	
	//this.offset = Math.random()*10;
//	this.count = 0;
} ;

p.handleClick = function (event) {
	//alert("You clicked on a button: "+this.label);
} ;

p.handleRollOver = function(event) {   
	this.background.scaleX=event.type == "rollover" ? -1 : 1;
	this.background.scaleY=event.type == "rollover" ? -1 : 1;
	stage.update()
};

window.BoutonRond = createjs.promote(BoutonRond, "Container");
}());

//chronomètre
(function() {

function Chrono() {
	this.Container_constructor();
	this.setup();
}
	var p = createjs.extend(Chrono, createjs.Container);
	p.setup = function() {
		var joue
		this.joue=joue
		var t=0;this.t=t
		var tc=0;this.tc=tc
		var fond=new cjs.Shape()
		fond.graphics.f('#EFF').rr(0,0,80,40,8)
		var tour=new cjs.Shape()
		tour.graphics.ss(10).ls(["#666","#EEE","#666"], [0,0.5, 1], 0, 0, 0, 40).rr(0,0,80,40,8)
		var contText=new cjs.Container().set({x:15,y:5,scaleX:0.9})
		var txt1=new cjs.Text('00','30px Arial Narrow Bold','black').set({x:18,textAlign:'right'})
		this.txt1=txt1
		var txt2=new cjs.Text(':','30px Arial Narrow Bold','black').set({x:20})
		var txt3=new cjs.Text('00','30px Arial Narrow Bold','black').set({x:30})
		this.txt3=txt3;
		contText.addChild(txt1,txt2,txt3)
		this.addChild(fond,contText,tour)
		
		this.demarre=function(){
			tc=0
		}
		this.afficheheure=function(){
		//nombre de secondes décimales
			var t1=tc*1;
			//nombre de secondes entières
			var t2=Math.floor(t1);
			//nombre de centisecondes
			var t3=100*(t1-t2);
			var st=t2.toFixed(0);
			var st1=t3.toFixed(0);
			if (st1.length<2) {
				st1="0"+st1;
			}
			this.txt1.text=st;
			this.txt3.text=st1;
		}
	
	this.addEventListener('tick',function(e){
		if(this.joue){
			tc+=0.04
			tc=tc%100
			
		}
			e.target.afficheheure();
		
		});
	
	this.afficheheure();
	//this.cursor='pointer'
} ;
window.Chrono = createjs.promote(Chrono, "Container");
}());
///////////
//TextInput

class TextInput extends createjs.Container {
  constructor() {
    super();

    // Field Settings
    this.width = this.width||200;
    this.height = this.height||40;
	this.coBg=this.coBg||'#ccc'
	this.coTxt=this.coTxt||'#F33'
	this.coTxt1=this.coTxt1||'#999'
	this.fontStyle='14px Arial'

    // Text Settings
    this.placeHolder = '';
	this.placeHolderTextColor = this.coTxt1||'#F99';
    this.textColor = this.coTxt||'#222';
    this.fontSize = this.fontSize||20;
    this.cursorWidth = 1;
    this.cursorColor =this.coTxt||'#555';

    // Private Settings
    this._hiddenInput = null;
    this._bg = null;
    this._placeHolderText = null;
    this._visiblePreCursorText = null;
    this._visiblePostCursorText = null;
    this._preCursorText = "";
    this._postCursorText = "";
    this._cursor = null;
    this._padding = 0;
    this._focused = false;
    this._selectedDuration = 0;

    this._setupDomNode();
    this._setupField();
    this._setupListeners();
  }

  update() {
    this._setupField();
  }

  _getFontStyle() {
    return this.fontStyle||'16px Arial';
  }

  _setupDomNode() {
    this._hiddenInput = document.createElement('input');
    this._hiddenInput.type = 'text';
    this._hiddenInput.style.display = 'none';
    this._hiddenInput.style.position = 'absolute';
    this._hiddenInput.style.zIndex = -100;
    document.body.appendChild(this._hiddenInput);
  }

  _setupField() {
    this._setupVariables();
    this._setupBg();
    this._setupPlaceHolderText();
    this._setupVisibleText();
    this._setupCursor();
  }

  _setupVariables() {
    this._padding = this.height - this.fontSize * 1.5;
  }

  _setupBg() {
    if (this._bg === null) {
      this._bg = new createjs.Shape();
      this.addChild(this._bg);
    } else {
      this._bg.graphics.clear();
    }
    this._bg.graphics.s(this.coTxt).beginFill(this.coBg).drawRect(0, 2, this.width, this.height);
  }

  _setupPlaceHolderText() {
    if (this._placeHolderText === null) {
      this._placeHolderText = new createjs.Text(
        this.placeHolder,
        this._getFontStyle(),
       // this.placeHolderTextColor
		this.coTxt1
      );
      this._placeHolderText.y = this._placeHolderText.x = this._padding;
      this.addChild(this._placeHolderText);
    } else {
      this._placeHolderText.text = this.placeHolder;
    }
  }

  _setupVisibleText() {
    if (this._visiblePreCursorText === null) {
      this._visiblePreCursorText = new createjs.Text(
        this._preCursorText,
        this._getFontStyle(),
        this.textColor
      );
      this._visiblePreCursorText.y = this._visiblePreCursorText.x = this._padding;
      this.addChild(this._visiblePreCursorText);
    } else {
      this._visiblePreCursorText.text = this._preCursorText;
    }

    if (this._visiblePostCursorText === null) {
      this._visiblePostCursorText = new createjs.Text(
        this._postCursorText,
        this._getFontStyle(),
        this.textColor
      );
      this._visiblePostCursorText.y = this._visiblePostCursorText.x = this._padding;
      this.addChild(this._visiblePostCursorText);
    } else {
      this._visiblePostCursorText.text = this._postCursorText;
    }
  }

  _setupCursor() {
    if (this._cursor === null) {
      this._cursor = new createjs.Shape();
      this._cursor.graphics
        .beginFill(this.cursorColor)
        .drawRect(this._padding, this.fontSize * .25, this.cursorWidth, this.fontSize * 0.8);
      this._cursor.x = 0; // this will signify pure text offset
      this._cursor.visible = false;
      this.addChild(this._cursor);
    } else {

    }
  }

  _setupListeners() {
    window.addEventListener('click', (e) => {
      // Page
      const pX = e.offsetX;
      const pY = e.offsetY;
//	  const pX = e.pageX;
//      const pY = e.pageY;
      // Canvas
      if (this.stage === null) return;
      const cX = this.stage.canvas.offsetLeft;
      const cY = this.stage.canvas.offsetTop;
	  
      // Local
      const lX = pX - cX - this.x;
      const lY = pY - cY - this.y;
      this._click({x: lX, y: lY});
    });
    this._hiddenInput.addEventListener('input', (e) => {
      if (this._focused) {
        e.preventDefault();
        this._preCursorText = this._hiddenInput.value.substring(0,4);
        this.update();
        this._cursor.x = this._visiblePreCursorText.getMeasuredWidth();
      }
    });

    this.on('tick', () => this._tick);
  }

  _click(localXY) {
    this._focused = (
      localXY.x > 0 &&
      localXY.y > 0 &&
      localXY.x < this.width &&
      localXY.y < this.height
    );
    this._selectedDuration = 0;

    this._placeHolderText.visible = !this._focused && this._hiddenInput.value === "";
    if (this._focused) {
      this._selectInput();
    } else {
      this._deSelectInput();
      this._cursor.visible = false;
    }
  }

  _tick() {
    if (this._focused) {
      if (this._selectedDuration % 8 === 0) {
        this._cursor.visible = !this._cursor.visible;
      }
      this._selectedDuration++;
    }
  }

  _selectInput() {
    this._hiddenInput.style.display = 'block';
	var P=this.localToGlobal(x,y)
	this._hiddenInput.style.left = (this.x + this.stage.canvas.offsetLeft + this._padding) + 'px';
    this._hiddenInput.style.top = (this.y + this.stage.canvas.offsetTop + this._padding) + 'px';
    this._hiddenInput.focus();
  }

  _deSelectInput() {
    this._hiddenInput.style.display = 'none';
  }
}
