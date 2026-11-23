import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// Church Wear church map. Reads the live feed (updated nightly from GHL) and falls back to a
// built-in copy. Data: https://github.com/jzdogazzz/churchwear-map

type Pin = [string, string, string, string, number, number] // name, city, state, website, lat, lon
interface Feed { churches: number; states: number; pins: Pin[] }

const FEED = "https://raw.githubusercontent.com/jzdogazzz/churchwear-map/main/churches.json"
const ZIPS = "https://raw.githubusercontent.com/jzdogazzz/churchwear-map/main/zips.json"
const FALLBACK: Feed = {"churches":179,"states":37,"pins":[["Church on the Rock Alaska","Wasilla","AK","https://churchak.org",61.5831,-149.4182],["Life Church Huntsville","Huntsville","AL","https://lifechurchhuntsville.com",34.7166,-86.5935],["The Rock Family","Huntsville","AL","https://therockfamily.org",34.7279,-86.617],["The Way City Church","Birmingham","AL","https://thewaycity.church",33.5398,-86.7528],["Woodland Heights Baptist Church","Conway","AR","https://whbcconway.org",35.0884,-92.4996],["Bethel Chandler","Chandler","AZ","https://bethelaz.com",33.2254,-111.8027],["Legacy Church","Chandler","AZ","https://legacyaz.church",33.3054,-111.9493],["Lifeway Church","Goodyear","AZ","https://lifewaychurchaz.com",33.4496,-112.4164],["My Daily Bread Global","Phoenix","AZ","https://mydailybread.global",33.5026,-112.0041],["One Life Church","Mesa","AZ","https://onelifeaz.church",33.3832,-111.6855],["Passion Church","Casa Grande","AZ","https://passionchurchaz.com",32.9087,-111.7485],["Compass Bible Church","Huntington Beach","CA","https://compasshb.com",33.7407,-118.0396],["Crossroads Community Church","Valencia","CA","",34.4382,-118.5771],["Downey First Christian Church","Downey","CA","https://downeyfirst.org",33.943,-118.1321],["First Christian Church HB","Huntington Beach","CA","https://fcchb.com",33.6713,-118.0018],["Incredible Church","Vallejo","CA","https://incrediblechurch.org",38.0863,-122.197],["Jessup University","Rocklin","CA","https://jessup.edu",38.8185,-121.2926],["Joshua Springs Calvary Chapel","Yucca Valley","CA","https://joshuasprings.com",34.105,-116.419],["Mobilize Love","Pacifica","CA","https://mobilizelove.org",37.5984,-122.4984],["Neuma Church","Torrance","CA","https://www.neumachurch.org",33.8608,-118.3161],["Portrait Church","Redlands","CA","https://portrait.church",34.0535,-117.1892],["Revere Church","Placentia","CA","https://reverechurch.com",33.8762,-117.8692],["The Garden Fellowship","Indio","CA","https://www.thegardenfellowship.com",33.7689,-116.2691],["Thrive Church","Elk Grove","CA","https://ithrivechurch.com",38.4343,-121.4637],["Together Church","Elk Grove","CA","https://togetherchurch.co",38.4119,-121.4784],["Beacon Church Denver","Denver","CO","https://www.denverbeacon.org",39.7419,-104.9748],["Cherry Hills Community Church","Highlands Ranch","CO","",39.5393,-104.9457],["Citipointe Church Northern Colorado","Loveland","CO","https://citipointeloveland.com",40.4109,-104.9962],["Community Bible Church Denver","Lakewood","CO","https://www.cbcdenver.com",39.706,-105.1555],["Front Range Baptist Church","Fort Collins","CO","https://frontrangebaptist.org",40.5235,-105.0664],["Orchard Church","Lochbuie","CO","https://orchard.church",39.9889,-104.7569],["Timberline Church","Fort Collins","CO","https://timberlinechurch.org",40.5487,-105.0391],["Elevate","Manchester","CT","https://faithtabernacle.com",41.8026,-72.5111],["Harvest Time Church","Greenwich","CT","https://htchurch.com",41.0809,-73.7085],["The Journey","Wilmington","DE","https://yourjourney.tv",39.7916,-75.5274],["Anastasia Church","Saint Augustine","FL","https://www.anastasiachurch.org",29.8661,-81.2826],["Beaches Chapel Church","Neptune Beach","FL","https://beacheschapel.com",30.3143,-81.4018],["Bold City Church","Jacksonville","FL","https://boldcity.church",30.4883,-81.6231],["Crossway Church","Pembroke Pines","FL","",26.0203,-80.3541],["Destiny Community Church","Newberry","FL","https://destinycommunitychurch.org",29.6549,-82.5594],["Elevate Church","Miami Lakes","FL","https://goelevatechurch.com",25.9133,-80.3413],["Illuminate Church","Kissimmee","FL","https://illuminatechurch.com",28.2957,-81.6016],["Oceans Church","Destin","FL","https://oceanschurch.org",30.3987,-86.5049],["Upper Room","Gulf Breeze","FL","https://uprmchurch.com",30.3618,-87.1706],["Dunwoody Baptist Church","Dunwoody","GA","https://dbc.org",33.9426,-84.3395],["First City Church","Alpharetta","GA","https://firstcity.com",34.0756,-84.2927],["Highlands Church","Cumming","GA","https://highlandschurch.tv",34.2164,-84.1494],["Mount Pisgah Church","Johns Creek","GA","https://www.mountpisgah.org",34.0203,-84.276],["Olive Branch","Ellabell","GA","https://obbc-ga.com",32.185,-81.4817],["One Church","Fayetteville","GA","https://beonechurch.com",33.4546,-84.4349],["Pleasant Grove Baptist Church","Royston","GA","https://theplaceofhope.com",34.2844,-83.1009],["Rincon Church of God","Rincon","GA","https://rcog.tv",32.3185,-81.2477],["Connect Point Church","HILO","HI","https://www.connectpointchurch.com",19.7011,-155.0663],["Candeo Church","Cedar Falls","IA","https://candeochurch.com",42.4981,-92.4314],["Lutheran Church of Hope","West Des Moines","IA","",41.5817,-93.8076],["One Place Church","Hayden","ID","https://oneplacechurch.com",47.7476,-116.8511],["Rockharbor Church","Meridian","ID","https://rockharbor.tv",43.6645,-116.4449],["Harvest Chapel","Sandwich","IL","https://www.harvestchapel.net",41.6313,-88.6273],["Metro Community Church","Edwardsville","IL","https://www.metrocommunitychurch.com",38.786,-89.9122],["Mission Church","Bloomingdale","IL","https://wearemission.com",41.9514,-88.1162],["New Life Church","Yorkville","IL","https://nlcyorkville.org",41.6743,-88.4479],["Fair Haven Christian Church","Franklin","IN","https://fairhavencc.org",39.4323,-86.1312],["Kingsway Christian Church","Avon","IN","https://www.kingswaychurch.org",39.7651,-86.3919],["The Chapel","West Lafayette","IN","https://thechapelgl.com",40.4601,-86.9339],["The Chapel / Salt Company","West Lafayette","IN","https://thechapelgl.com",40.4601,-86.9339],["Your Venture Church","Pittsboro","IN","https://yourventurechurch.org",39.8651,-86.4464],["Fellowship West","Kansas City","KS","https://fellowshipwest.com",39.1415,-94.8143],["Hope Point Church","Olathe","KS","https://hopepointkc.com",38.8568,-94.7593],["First Baptist Church Paducah","Paducah","KY","",37.0721,-88.6339],["Calvary Baptist Church","Alexandria","LA","https://calvarynet.net",31.2739,-92.483],["Cedar Crest Baptist Church","West Monroe","LA","https://ccbchurch.org",32.5385,-92.2143],["Norris Ferry Church","Shreveport","LA","https://norrisferrychurch.org",32.3575,-93.7137],["Revival Temple","Walker","LA","https://revivaltemple.com",30.472,-90.8628],["Lift Church","Salisbury","MD","https://liftchurch.org",38.4211,-75.5552],["NNE Youth Alive","Lewiston","ME","",44.1212,-70.199],["Hillsdale UB Church","Hillsdale","MI","https://www.hillsdaleub.org",41.8917,-84.6084],["Journey Church","Alexandria","MI","https://thejchurch.com",31.2768,-92.4714],["Keystone Church","Saline","MI","https://keystonechurch.us",42.1767,-83.7959],["Kirby Church","Flat Rock","MI","https://kirbychurch.com",42.0942,-83.3283],["Mile City Church","Plymouth","MI","https://milecity.com",42.376,-83.4498],["Abundant Life Church","Hibbing","MN","https://alchibbing.org",47.4005,-92.9187],["First Baptist Church Lebanon","Lebanon","MO","https://teamfbc.net",37.6816,-92.6673],["Hope City Church","Joplin","MO","https://hopeforjoplin.city",37.0433,-94.4243],["Reach KC Church","Kansas City","MO","https://reachkc.org",39.0311,-94.4833],["All Seasons Worship Center","Forest","MS","https://allseasonsworshipcenter.net",32.3057,-89.4886],["Church of the Crossroads","Corinth","MS","https://churchofthecrossroads.com",34.9076,-88.489],["Compel Church","Southaven","MS","https://www.compel.church",34.9335,-89.974],["Mosaic Church","Ocean Springs","MS","https://mosaicgc.com",30.4162,-88.8086],["Picayune First Baptist Church","Picayune","MS","https://fbcpic.org",30.5279,-89.6828],["Venture Church","Hattiesburg","MS","https://venturechurch.org",31.3034,-89.3582],["Biltmore Church","Arden","NC","https://biltmorechurch.com",35.486,-82.5715],["Circle City Church","High Point","NC","https://thecirclecity.org",35.926,-79.991],["City Church - Student City","Gastonia","NC","https://citync.com",35.2219,-81.1485],["Community Bible Church","High Point","NC","https://cbchurch.org",36.0322,-80.0192],["Providence Baptist Church","Raleigh","NC","https://pray.org",35.8574,-78.7047],["Salem Baptist Church","Apex","NC","https://salemapex.org",35.755,-78.8454],["Bonfire Worship","Elkhorn","NE","",41.2566,-96.2278],["Christ Community Church","Omaha","NE","https://www.cccomaha.org",41.2559,-96.0814],["Church of the Heartland","Omaha","NE","https://churchoftheheartland.org",41.2438,-95.9301],["Citylight Bennington","Bennington","NE","https://citylightbennington.church",41.3262,-96.1584],["Crossroads Church","Lincoln","NE","https://lincolncrossroads.com",40.8561,-96.6632],["Dream City","Omaha","NE","https://dreamcityomaha.church",41.2342,-96.0437],["Flatland Church","Omaha","NE","https://www.flatlandchurch.com",41.3024,-96.1388],["Greater Omaha Youth for Christ","Omaha","NE","https://goyfc.org",41.267,-96.0846],["King of Kings","Omaha","NE","https://www.kingofkings.org",41.2162,-96.0936],["Life.Church Omaha","Omaha","NE","https://life.church",41.1939,-96.1879],["Love Church","Omaha","NE","https://lovechurch.org",41.2265,-96.1098],["O,NE","Omaha","NE","",41.263,-96.1542],["Within Reach","Omaha","NE","https://withinreach.com",41.2594,-95.9408],["CrossPoint Church","Waretown","NJ","https://crosspointnj.com",39.8001,-74.192],["CrossPoint Church NJ","Farmingdale","NJ","https://crosspointnj.com",40.2159,-74.1525],["Love of Jesus","City of Orange","NJ","https://theloveofjesus.org",40.765,-74.242],["Central Church","Henderson","NV","https://centralchurch.online",36.0729,-114.9908],["Convo Church","Reno","NV","https://convochurch.com",39.5067,-119.752],["Grace Church Reno","Reno","NV","https://gracechurchreno.org",39.5229,-119.8821],["The Pursuit Collective","Reno","NV","https://thepursuitcollective.org",39.4463,-119.7349],["East Gate Church","North Massapequa","NY","https://eastgatechurch.us",40.7075,-73.4831],["Gracepoint Gospel Church","New City","NY","https://gracepointny.org",41.1489,-74.0231],["Life Church Buffalo","West Seneca","NY","https://lifechurchbuffalo.com",42.8325,-78.7218],["Reach Church","White Plains","NY","https://reachny.church",41.0046,-73.7627],["Avenue Church","Ontario","OH","https://churchontheave.com",40.7597,-82.5775],["Friends Church","Salem","OH","https://friendschurch.online",40.9735,-80.862],["House of Praise","Lorain","OH","https://hopchurch.org",41.4182,-82.1326],["Lifepoint Church","Lewis Center","OH","https://lifepointohio.com",40.189,-83.0223],["Queen City Church","Cincinnati","OH","https://www.queencitypeople.com",39.1762,-84.4463],["Rhythm Church","Liberty Township","OH","https://rhythm.church",39.3841,-84.3692],["The MVMNT Camp","Columbus","OH","https://www.themvmntcamp.com",39.8651,-82.8301],["The Way Church","Sapulpa","OK","https://thewaychurch.church",35.9884,-96.1249],["Engage","Tyrone","PA","https://engagefestpa.com",40.7005,-78.2579],["Grace Covenant Community Church","Middleburg","PA","https://g3c.net",40.7971,-77.0758],["Immanuel Church","Lansdale","PA","https://lansdale.church",40.2528,-75.3028],["Victory Church Philadelphia","Audubon","PA","https://getvictory.net",40.1161,-75.4211],["Freedom Church","Moncks Corner","SC","https://freedomchurch.sc",33.0897,-80.0373],["Generate","Columbia","SC","https://www.generatecolumbia.com",34.0906,-81.2185],["Lifepointe Church","Fort Mill","SC","https://lifepointecc.com",35.0594,-80.922],["City Hills Church","Knoxville","TN","https://cityhills.com",35.9471,-83.9999],["Grace Community Church","Crossville","TN","https://crossvillegrace.com",35.9338,-85.0243],["Grace Valley Church","Collierville","TN","https://gracevalleymemphis.org",35.0279,-89.7104],["Hope Church","Johnson City","TN","https://hopejc.org",36.4097,-82.4747],["The Experience Community Church","Murfreesboro","TN","https://experiencecc.com",35.8406,-86.3968],["The Place of The Outpouring","Memphis","TN","https://myplacememphis.org",35.0627,-89.9152],["Two Rivers Church","Lenoir City","TN","https://2rc.tv",35.8043,-84.2286],["CYLife Church","","TX","https://www.cylifechurch.com",29.8918,-95.7079],["Celebration Church","Georgetown","TX","https://celebration.church",30.5851,-97.6861],["Champion Forest","Houston","TX","https://championforest.org",30.0053,-95.5111],["Chosen Road Church","Cypress","TX","https://chosenroad.church",29.9723,-95.7332],["Christian Youth Theater","Lewisville","TX","https://www.cyt.org",33.044,-97.0156],["Coggin Ave. Baptist Church","Brownwood","TX","https://cogginchurch.org",31.7041,-98.9838],["Discover Church","Castroville","TX","https://mydiscover.church",29.3533,-98.8688],["Elevate Church Midland","Midland","TX","https://elevatemidland.com",31.9911,-102.0989],["Foundation Christian Ministries","Bastrop","TX","https://myfcm.org",30.1348,-97.4121],["GodChasers","San Antonio","TX","https://godchasers.church",29.4417,-98.474],["Highridge Church","Hudson Oaks","TX","https://highridgechurch.com",32.7542,-97.7165],["MetaChurch","Helotes","TX","https://metachurch.tv",29.599,-98.7016],["New Beginnings Church","Longview","TX","",32.5651,-94.8194],["One City Church","Beaumont","TX","",30.0998,-94.136],["Radical Church","Kyle","TX","https://radicalchurch.life",30.0069,-97.8834],["Redeemed Church","Midland","TX","",32.0357,-102.13],["Soma Church Tyler","Tyler","TX","https://somatyler.org",32.3077,-95.3037],["South Texas Youth for Christ","San Antonio","TX","https://styfc.net",29.5487,-98.5682],["Southmont Students Ministry","Denton","TX","https://southmont.org",33.1759,-97.119],["The Gathering Houston","Stafford","TX","https://www.thegatheringhouston.com",29.6318,-95.5358],["The Pursuit Church of Harlingen","Harlingen","TX","https://thepursuithrl.com",26.2405,-97.7399],["Turning Point Church","Vidor","TX","https://tpcov.org",30.1734,-94.024],["Turning Point Church of Vidor","Vidor","TX","https://turningpointchurch.com",30.1734,-94.024],["United City","Humble","TX","",30.0078,-95.2511],["Vital Church","Mcallen","TX","https://vitalchurch.com",26.2015,-98.2147],["WAR","Houston","TX","",29.7195,-95.3523],["Wake Church","Conroe","TX","https://wakechurch.com",30.3265,-95.4979],["Calvary Revival Church","Norfolk","VA","https://crcglobal.org",36.8488,-76.2062],["InterVarsity in Virginia","Charlottesville","VA","https://intervarsity.org",38.0586,-78.4538],["Mount Vernon Church","Glen Allen","VA","https://mountvernon.church",37.6786,-77.5856],["Reap the Harvest Foundation","Forest","VA","https://reaptheharvestfoundation.com",37.3568,-79.2967],["The Bridge Church","Hampton","VA","https://thebridgechurchva.com",37.0556,-76.3748],["The Life Church","Richmond","VA","https://wearetlc.org",37.5338,-77.54],["Evolve Church","Milwaukee","WI","",43.1361,-88.0055],["Faith Community Church","Janesville","WI","https://faithcommunitychurch.net",42.7104,-88.9865],["Fox River Christian Church","Waukesha","WI","https://foxriverchristian.org",42.9594,-88.2306],["Jesus Changes Lives","Milwaukee","WI","",42.9812,-87.983]]}
const STATES: Record<string, string> = {"AL":"M639,383L686,379L699,425L706,438L703,448L707,466L658,471L664,483L661,487L656,488L651,479L649,487L644,487L640,453L641,385Z","AK":"M105,566L106,566L108,562L109,563L111,563L111,565L108,565L107,566ZM99,571L102,569L103,569L105,567L109,567L110,571L108,570L108,572L107,571L103,576L103,573L101,575ZM51,544L53,544L56,543L58,544L58,547L55,548L51,545ZM38,596L41,596L43,594L42,593L45,592L47,594L44,596L42,596L39,597ZM57,501L63,499L68,497L70,497L72,497L71,500L72,501L75,501L78,502L79,500L81,501L79,499L78,499L78,498L76,495L77,495L78,497L79,499L80,499L78,497L79,494L77,494L73,493L73,489L69,485L66,482L68,480L68,478L71,479L74,479L77,476L78,472L80,470L82,469L83,469L84,469L88,466L92,466L94,465L95,463L99,464L98,465L98,466L100,464L101,465L101,466L102,467L103,466L105,466L107,466L107,468L109,468L108,469L110,470L112,469L112,469L115,468L120,470L125,470L127,471L132,469L137,472L138,472L153,543L155,543L157,543L157,542L160,541L160,544L167,549L169,551L171,548L171,545L174,542L177,543L177,545L178,545L181,548L183,548L185,550L187,552L194,559L194,560L196,562L204,563L205,565L207,568L206,574L204,573L203,571L199,570L199,567L198,570L194,566L195,564L193,561L190,560L188,560L188,558L186,555L183,553L181,553L178,549L176,546L179,554L178,553L176,553L174,550L174,551L175,553L173,555L168,553L165,551L158,548L159,548L158,546L156,548L154,548L151,546L146,546L141,548L140,547L138,546L138,545L136,546L134,545L131,547L132,545L134,544L131,544L129,540L128,542L127,541L126,543L125,543L126,540L125,541L124,544L125,544L126,546L125,548L127,549L125,550L121,550L120,549L120,552L117,555L117,553L115,556L112,557L111,556L111,555L113,554L111,552L113,549L113,546L113,545L116,542L118,543L119,542L118,540L115,540L113,542L112,543L109,547L109,547L106,553L105,553L102,556L102,557L105,559L105,560L103,562L102,565L99,566L96,568L95,570L94,570L92,572L93,573L92,574L90,574L89,576L88,575L83,579L85,580L83,581L77,582L74,585L72,584L69,585L70,583L69,583L67,587L62,588L59,590L56,589L54,590L53,589L56,587L63,586L66,582L69,581L73,580L73,581L75,582L74,581L75,578L78,577L82,575L83,575L84,572L87,569L89,562L90,560L90,559L86,561L84,559L83,560L84,562L82,562L80,558L79,559L77,557L71,560L71,559L71,557L71,554L72,553L70,547L70,549L65,549L63,549L63,547L62,545L59,543L61,542L61,540L62,539L58,535L59,534L58,532L60,532L60,530L64,526L65,523L68,522L70,524L71,524L74,521L78,522L79,520L79,516L78,514L79,514L80,512L79,511L74,513L68,512L66,513L62,511L61,507L62,505L59,504ZM32,598L36,595L38,594L38,596L35,598ZM41,515L42,514L45,515L46,515L49,518L52,519L51,520L49,520L48,521L46,518L44,516L42,517ZM7,598L12,600L10,599ZM1,597L7,597L4,598ZM-7,597L-5,595L-3,596ZM-10,595L-7,595L-8,596ZM-49,567L-46,568L-46,570L-48,569ZM201,573L201,571L202,573ZM191,573L192,571L193,573ZM190,569L190,566L191,565L198,570L196,570L199,572L200,576L196,575L194,573L197,577L195,576L194,572L190,570ZM185,563L187,562L187,561L190,560L193,563L189,565L189,568L187,568ZM179,552L181,553L183,553L185,556L183,555L186,558L184,562L183,561L184,559ZM179,561L179,559L182,559L184,564L186,569L182,565L181,565L180,561ZM178,562L180,562L179,564ZM174,557L174,556L176,554L180,555L182,559L181,559L179,558L179,561L176,560ZM126,551L129,546L130,547L128,550ZM126,548L127,545L127,548Z","AZ":"M150,405L154,405L153,390L159,385L161,376L168,374L162,355L165,331L177,331L181,313L268,328L251,454L212,448L148,410Z","CO":"M280,238L363,247L397,250L395,272L391,340L374,339L268,328Z","FL":"M789,600L796,593L800,596ZM707,466L711,472L762,469L765,473L766,462L776,464L782,483L791,497L800,508L802,519L815,541L818,550L819,570L815,582L802,585L796,574L787,571L782,560L773,553L762,538L767,530L758,530L756,523L759,517L758,507L742,495L736,488L724,485L710,498L704,497L703,492L692,485L678,483L661,487L664,483L658,471Z","GA":"M686,379L709,376L731,373L728,380L737,384L744,395L758,404L767,413L777,432L781,433L778,440L776,464L766,462L765,473L762,469L711,472L707,466L703,448L706,438L699,425Z","IN":"M638,231L643,232L649,229L683,225L683,227L689,285L690,292L680,295L681,298L674,305L673,311L658,313L653,318L644,315L637,320L636,317L644,298L641,288L643,284Z","KS":"M395,272L510,276L517,280L513,286L522,295L522,343L391,340Z","ME":"M904,153L897,147L885,106L889,106L889,100L894,90L892,80L893,71L899,52L906,56L915,50L923,54L932,83L938,83L939,90L945,91L950,98L943,109L940,107L937,113L930,117L930,123L924,113L922,128L911,134L906,141Z","MA":"M865,170L878,167L897,163L903,157L908,161L903,168L910,173L914,179L924,179L913,185L913,181L906,188L904,185L903,184L899,178L892,180L865,186Z","MN":"M480,74L510,74L510,66L515,68L518,80L530,82L531,85L543,82L562,91L565,94L575,89L577,92L586,91L595,93L581,101L572,108L558,122L559,124L555,125L555,138L549,143L547,150L549,156L548,168L553,172L563,177L564,180L574,187L575,195L491,197L491,157L484,150L489,142L489,134L486,126L485,105L481,93L482,81Z","NJ":"M844,247L844,245L845,242L855,232L844,222L844,216L849,206L864,210L863,218L863,219L861,223L866,224L867,238L865,247L857,260L857,255L845,250L844,247Z","NC":"M751,334L776,331L853,316L854,323L842,332L857,329L859,337L854,344L838,343L849,346L845,355L850,351L853,353L850,362L841,362L833,369L828,383L818,385L793,367L773,370L768,364L745,366L731,373L709,376L709,370L717,362L723,361L743,345L747,345Z","ND":"M379,69L480,74L482,81L481,93L485,105L486,126L489,134L489,142L373,137Z","OK":"M374,339L391,340L522,343L522,354L526,379L526,419L512,412L495,415L492,418L481,412L476,417L455,407L452,409L439,402L430,401L425,397L427,353L373,350Z","PA":"M752,210L763,202L764,208L835,194L842,202L849,206L844,216L844,222L855,232L845,242L839,246L778,258L760,261L757,240Z","SD":"M371,158L373,137L489,142L484,150L491,157L491,197L488,215L491,220L477,211L465,213L457,208L367,203Z","TX":"M373,350L427,353L425,397L430,401L439,402L452,409L455,407L476,417L481,412L492,418L495,415L512,412L526,419L534,421L534,421L534,433L535,456L545,474L545,482L541,493L542,499L540,507L522,515L523,506L517,508L523,516L510,526L494,534L478,547L480,543L489,538L482,537L470,560L469,579L475,591L470,593L461,588L453,588L435,579L429,566L429,555L421,548L413,537L407,519L392,503L376,499L369,502L364,514L359,518L339,508L333,501L330,488L326,477L318,473L299,450L298,445L365,451L373,350Z","WY":"M371,158L367,203L363,247L280,238L247,233L251,211L260,156L261,145Z","CT":"M865,186L892,180L895,195L879,201L868,210L868,203Z","MO":"M502,263L522,263L570,260L575,265L574,273L577,280L588,291L590,297L599,299L596,313L611,324L612,333L619,339L619,347L615,351L614,351L613,351L610,362L599,363L603,357L602,352L522,354L522,343L522,295L513,286L517,280L510,276Z","WV":"M729,295L734,294L737,280L740,283L745,270L750,270L755,262L757,240L760,261L778,258L780,269L790,258L795,259L800,254L809,261L808,266L798,260L798,267L792,277L789,276L786,286L779,283L779,287L772,305L772,309L757,318L749,320L743,313L737,311L730,301Z","IL":"M575,265L580,258L582,249L580,242L592,237L594,225L585,217L632,214L632,218L638,231L643,284L641,288L644,298L636,317L637,320L637,327L630,329L631,336L623,334L619,339L612,333L611,324L596,313L599,299L590,297L588,291L577,280L574,273Z","NM":"M268,328L374,339L373,350L373,350L365,451L298,445L299,450L268,446L266,456L251,454Z","AR":"M522,354L602,352L603,357L599,363L610,362L612,365L603,376L605,382L601,385L598,390L597,399L588,410L590,413L588,431L534,433L534,421L534,421L526,419L526,379Z","CA":"M40,162L106,181L106,181L90,246L118,289L139,321L162,355L168,374L161,376L159,385L153,390L154,405L150,405L105,400L103,381L93,369L88,368L88,361L76,356L72,349L56,344L53,340L57,328L49,314L42,292L47,286L38,275L40,262L45,271L43,258L40,261L33,254L36,249L27,230L31,211L26,199L26,195L33,187L38,175Z","DE":"M839,246L845,242L844,245L844,251L849,259L855,263L858,271L847,273Z","DC":"M821,268L823,270L821,268Z","HI":"M308,580L313,574L312,568L325,574L335,585L320,594L316,599L312,596ZM295,554L303,553L309,557L300,561ZM282,550L283,547L294,549ZM262,539L268,536L275,546L265,546ZM230,529L234,525L240,528L234,532Z","IA":"M491,197L575,195L578,212L585,217L594,225L592,237L580,242L582,249L580,258L575,265L570,260L522,263L502,263L499,243L491,220L488,215Z","KY":"M619,339L623,334L631,336L630,329L637,327L637,320L644,315L653,318L658,313L673,311L674,305L681,298L680,295L690,292L689,285L696,284L701,290L717,293L723,288L729,295L730,301L737,311L743,313L731,324L725,334L716,338L665,343L642,345L639,349L615,351L619,347Z","MD":"M778,258L839,246L847,273L858,271L857,281L850,284L846,286L846,279L840,280L836,275L841,272L834,267L835,256L831,259L833,274L836,282L829,282L822,274L823,270L821,268L809,261L800,254L795,259L790,258L780,269Z","MI":"M649,229L652,225L657,213L656,200L650,186L649,177L653,170L652,162L661,150L662,160L665,156L665,148L671,144L668,141L672,135L684,141L694,142L698,149L699,165L691,179L696,182L701,173L706,170L712,174L718,192L717,201L712,202L708,216L705,223L683,227L683,225ZM600,96L608,89L608,92ZM584,126L593,120L598,119L617,104L624,104L616,109L617,115L625,117L630,123L643,123L649,118L667,114L667,120L674,121L679,118L682,127L690,126L691,130L678,131L674,129L671,134L660,130L658,133L650,134L638,138L630,155L626,150L626,150L626,143L621,138L589,131L585,126L585,126Z","MS":"M588,431L590,413L588,410L597,399L598,390L601,385L639,383L641,385L640,453L644,487L634,487L623,492L616,482L617,474L581,476L583,465L593,446L589,443Z","MT":"M203,43L379,69L373,137L371,158L261,145L260,156L255,149L253,154L241,151L239,153L229,152L228,144L223,141L224,137L219,121L212,125L210,118L217,100L209,93L205,83L200,78L201,72L198,65Z","NH":"M880,114L881,108L885,106L897,147L904,153L903,157L897,163L878,167L875,148L877,136L876,131L882,125Z","NY":"M763,202L776,188L770,178L779,174L804,171L814,163L814,154L810,149L815,144L822,132L829,126L852,121L856,133L855,142L861,152L865,170L865,186L868,203L868,210L885,206L888,201L893,203L877,216L866,221L863,218L864,210L849,206L842,202L835,194L764,208Z","OH":"M683,227L705,223L722,229L734,224L744,214L752,210L757,240L755,262L750,270L745,270L740,283L737,280L734,294L729,295L723,288L717,293L701,290L696,284L689,285Z","OR":"M77,74L83,77L86,83L85,90L92,95L104,94L109,98L119,98L142,99L144,98L175,105L180,116L162,142L167,145L163,153L154,192L106,181L106,181L106,181L40,162L40,142L51,126L64,96L71,74Z","TN":"M610,362L613,351L614,351L615,351L639,349L642,345L665,343L716,338L751,334L747,345L743,345L723,361L717,362L709,370L709,376L686,379L639,383L601,385L605,382L603,376L612,365Z","UT":"M202,203L251,211L247,233L280,238L268,328L181,313Z","VA":"M850,284L857,281L853,288L851,302L847,301ZM743,313L749,320L757,318L772,309L772,305L779,287L779,283L786,286L789,276L792,277L798,267L798,260L808,266L809,261L821,268L823,270L822,274L821,281L833,283L840,288L840,299L844,305L841,310L849,308L853,316L776,331L751,334L716,338L725,334L731,324Z","WA":"M97,26L104,26L102,31ZM188,40L176,96L175,105L144,98L142,99L119,98L109,98L104,94L92,95L85,90L86,83L83,77L77,74L70,71L76,63L72,61L74,37L72,28L75,24L83,31L96,37L101,37L102,47L97,57L102,56L104,46L108,42L108,25L106,19Z","WI":"M559,124L567,122L575,118L584,126L585,126L585,126L589,131L621,138L626,143L626,150L626,150L630,155L625,164L625,168L633,159L638,150L639,155L633,167L633,176L629,197L632,214L585,217L578,212L575,195L574,187L564,180L563,177L553,172L548,168L549,156L547,150L549,143L555,138L555,125Z","NE":"M367,203L457,208L465,213L477,211L491,220L499,243L502,263L510,276L395,272L397,250L363,247Z","SC":"M731,373L745,366L768,364L773,370L793,367L818,385L809,395L806,406L796,417L787,422L788,425L781,433L777,432L767,413L758,404L744,395L737,384L728,380Z","ID":"M175,105L176,96L188,40L203,43L198,65L201,72L200,78L205,83L209,93L217,100L210,118L212,125L219,121L224,137L223,141L228,144L229,152L239,153L241,151L253,154L255,149L260,156L251,211L202,203L154,192L163,153L167,145L162,142L180,116Z","NV":"M106,181L106,181L154,192L202,203L181,313L177,331L165,331L162,355L139,321L118,289L90,246Z","VT":"M852,121L880,114L882,125L876,131L877,136L875,148L878,167L865,170L861,152L855,142L856,133Z","LA":"M534,433L588,431L589,443L593,446L583,465L581,476L617,474L616,482L623,492L617,496L621,500L624,495L625,504L621,505L624,510L630,511L632,518L618,512L611,518L606,512L599,519L589,514L583,505L577,503L569,510L553,505L540,507L542,499L541,493L545,482L545,474L535,456Z","RI":"M895,195L892,180L899,178L903,184L900,183L901,193Z"}
const NAMES: Record<string, string> = {AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington, DC",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"}

const W = 975, H = 610
const project = (() => {
    const R = Math.PI / 180
    const cea = (p0: number, p1: number) => {
        const s0 = Math.sin(p0 * R), n = (s0 + Math.sin(p1 * R)) / 2, c = 1 + s0 * (2 * n - s0), r0 = Math.sqrt(c) / n
        return (l: number, f: number) => { const r = Math.sqrt(c - 2 * n * Math.sin(f * R)) / n; return [r * Math.sin(l * R * n), r0 - r * Math.cos(l * R * n)] }
    }
    const mk = (rot: number, cx: number, cy: number, p0: number, p1: number, k: number, tx: number, ty: number) => {
        const f = cea(p0, p1), c = f(cx, cy)
        return (lo: number, la: number) => { let l = lo + rot; l = (((l + 180) % 360) + 360) % 360 - 180; const p = f(l, la); return [tx + k * (p[0] - c[0]), ty - k * (p[1] - c[1])] }
    }
    const K = 1280, X = W / 2, Y = H / 2
    const L = mk(96, -0.6, 38.7, 29.5, 45.5, K, X, Y), A = mk(154, -2, 58.5, 55, 65, 0.35 * K, X - 0.307 * K, Y + 0.201 * K), Hi = mk(157, -3, 19.9, 8, 18, K, X - 0.205 * K, Y + 0.212 * K)
    return (lo: number, la: number, s: string) => (s === "AK" ? A(lo, la) : s === "HI" ? Hi(lo, la) : L(lo, la))
})()
const miles = (a: number, b: number, c: number, d: number) => {
    const R = Math.PI / 180, x = Math.sin(((c - a) * R) / 2) ** 2 + Math.cos(a * R) * Math.cos(c * R) * Math.sin(((d - b) * R) / 2) ** 2
    return 7917.5 * Math.asin(Math.sqrt(x))
}
const host = (w: string) => w.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")

let feedCache: Feed | null = null
let zipCache: Promise<Record<string, [number, number]>> | null = null
const loadZips = () => (zipCache ??= fetch(ZIPS).then((r) => r.json()).catch(() => { zipCache = null; return {} }))

interface Props {
    variant: "Section" | "Full page"
    ink: string
    paper: string
    land: string
    landActive: string
    accent: string
    ctaLabel: string
    ctaLink: string
    bodyFont?: React.CSSProperties
    labelFont?: React.CSSProperties
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ChurchMap(props: Props) {
    const { variant, ink, paper, land, landActive, accent, ctaLabel, ctaLink, bodyFont, labelFont, style } = props
    const full = variant === "Full page"
    const [feed, setFeed] = React.useState<Feed>(feedCache || FALLBACK)
    const [width, setWidth] = React.useState(1000)
    const [zip, setZip] = React.useState("")
    const [msg, setMsg] = React.useState("")
    const [origin, setOrigin] = React.useState<null | { xy: number[]; la: number; lo: number; zip: string }>(null)
    const [stateSel, setStateSel] = React.useState<string | null>(null)
    const [active, setActive] = React.useState<number | null>(null)
    const [view, setView] = React.useState([0, 0, W, H])
    const [query, setQuery] = React.useState("")
    const [open, setOpen] = React.useState<Record<string, boolean>>({})
    const rootRef = React.useRef<HTMLDivElement>(null)
    const anim = React.useRef(0)

    React.useEffect(() => {
        let live = true
        if (!feedCache) fetch(FEED, { cache: "no-cache" }).then((r) => r.json()).then((f: Feed) => {
            if (f && Array.isArray(f.pins) && f.pins.length >= FALLBACK.pins.length * 0.8) { feedCache = f; if (live) setFeed(f) }
        }).catch(() => {})
        return () => { live = false }
    }, [])
    React.useEffect(() => {
        const el = rootRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((e) => { const w = Math.round(e[0].contentRect.width); if (w > 0) setWidth(w) })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    React.useEffect(() => () => cancelAnimationFrame(anim.current), [])

    const pins = React.useMemo(() => feed.pins.map((p, i) => ({ i, n: p[0], c: p[1], s: p[2], w: p[3], la: p[4], lo: p[5], xy: project(p[5], p[4], p[2]) })), [feed])
    const perState = React.useMemo(() => { const m: Record<string, number> = {}; pins.forEach((p) => (m[p.s] = (m[p.s] || 0) + 1)); return m }, [pins])
    const nStates = Object.keys(perState).length
    const stacked = width < 760
    const zoom = W / view[2]

    const flyTo = (target: number[]) => {
        cancelAnimationFrame(anim.current)
        const from = view.slice(), t0 = performance.now(), dur = 650
        const step = (t: number) => {
            const u = Math.min(1, (t - t0) / dur), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
            setView(from.map((v, k) => v + (target[k] - v) * e))
            if (u < 1) anim.current = requestAnimationFrame(step)
        }
        anim.current = requestAnimationFrame(step)
    }
    const fit = (pts: number[][], pad = 60) => {
        let x0 = Math.min(...pts.map((p) => p[0])) - pad, x1 = Math.max(...pts.map((p) => p[0])) + pad
        let y0 = Math.min(...pts.map((p) => p[1])) - pad, y1 = Math.max(...pts.map((p) => p[1])) + pad
        let w = Math.max(x1 - x0, 240), h = Math.max(y1 - y0, 150)
        if (w / h > W / H) h = (w * H) / W; else w = (h * W) / H
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
        return [cx - w / 2, cy - h / 2, w, h]
    }
    const reset = () => { setOrigin(null); setStateSel(null); setActive(null); setMsg(""); setZip(""); flyTo([0, 0, W, H]) }

    const near = React.useMemo(() => {
        if (!origin) return null
        const d = pins.map((p) => ({ p, d: miles(origin.la, origin.lo, p.la, p.lo) })).sort((a, b) => a.d - b.d)
        return { list: d.slice(0, 5), within: d.filter((x) => x.d <= 100).length }
    }, [origin, pins])

    const findZip = async (e?: React.FormEvent) => {
        e?.preventDefault()
        const z = zip.trim()
        if (!/^\d{5}$/.test(z)) { setMsg("Enter a 5-digit ZIP code."); return }
        setMsg("Finding churches near " + z + "…")
        const zips = await loadZips()
        const g = zips[z]
        if (!g) { setMsg("We couldn't find that ZIP. Try a nearby one."); return }
        const st = g[1] < -140 ? (g[0] < 30 ? "HI" : "AK") : ""
        const xy = project(g[1], g[0], st)
        setStateSel(null); setActive(null); setMsg("")
        setOrigin({ xy, la: g[0], lo: g[1], zip: z })
        const d = pins.map((p) => ({ p, d: miles(g[0], g[1], p.la, p.lo) })).sort((a, b) => a.d - b.d).slice(0, 3)
        flyTo(fit([xy, ...d.map((x) => x.p.xy)], 50))
    }
    const pickState = (s: string) => {
        if (!perState[s]) return
        setOrigin(null); setActive(null); setMsg(""); setStateSel(s)
        flyTo(fit(pins.filter((p) => p.s === s).map((p) => p.xy), 70))
    }

    const mono: React.CSSProperties = { fontFamily: (labelFont && labelFont.fontFamily) || '"Spline Sans Mono", ui-monospace, monospace', fontWeight: 400, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }
    const serif: React.CSSProperties = { fontFamily: (bodyFont && bodyFont.fontFamily) || '"CHURCH WEAR Regular", "CHURCH WEAR", sans-serif', fontWeight: 400, letterSpacing: "-0.02em" }
    const mapPx = stacked ? width : Math.max(200, width - 380)
    const r = Math.max(4.6 / Math.sqrt(zoom), (3.4 * view[2]) / mapPx)
    const act = active !== null ? pins[active] : null
    const listForState = stateSel ? pins.filter((p) => p.s === stateSel).sort((a, b) => a.c.localeCompare(b.c) || a.n.localeCompare(b.n)) : []

    const rowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: `1px solid ${land}`, cursor: "pointer" }
    const Row = ({ p, right }: { p: (typeof pins)[number]; right?: string }) => (
        <div style={rowStyle} onClick={() => { setActive(p.i); flyTo(fit([p.xy], 90)) }} onMouseEnter={() => setActive(p.i)}>
            <div style={{ minWidth: 0 }}>
                <div style={{ ...serif, fontSize: 16, lineHeight: 1.2, color: ink }}>{p.n}</div>
                <div style={{ ...mono, fontSize: 11, color: accent, marginTop: 3 }}>{p.c}, {p.s}</div>
            </div>
            {right && <div style={{ ...mono, fontSize: 11, color: accent, whiteSpace: "nowrap", paddingTop: 3 }}>{right}</div>}
        </div>
    )

    const panel = (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: stacked ? "100%" : 340, flexShrink: 0 }}>
            <form onSubmit={findZip} style={{ display: "flex", gap: 0 }}>
                <input value={zip} inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="Enter your ZIP" aria-label="ZIP code"
                    onFocus={loadZips} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                    style={{ ...serif, flex: 1, minWidth: 0, height: 48, padding: "0 14px", fontSize: 16, color: ink, background: paper, border: `1px solid ${ink}`, borderRight: "none", borderRadius: 0, outline: "none" }} />
                <button type="submit" style={{ ...mono, height: 48, padding: "0 18px", background: ink, color: paper, border: `1px solid ${ink}`, borderRadius: 0, cursor: "pointer" }}>Find</button>
            </form>
            {msg && <div style={{ ...mono, fontSize: 11, color: accent }}>{msg}</div>}
            {near && (
                <div>
                    <div style={{ ...serif, fontSize: 22, lineHeight: 1.15, color: ink }}>
                        {near.within > 0 ? `${near.within} ${near.within === 1 ? "church" : "churches"} within 100 miles of ${origin!.zip}.` : `Closest churches to ${origin!.zip}.`}
                    </div>
                    <div style={{ marginTop: 10 }}>{near.list.map((x) => <Row key={x.p.i} p={x.p} right={`${Math.round(x.d)} mi`} />)}</div>
                </div>
            )}
            {stateSel && (
                <div>
                    <div style={{ ...serif, fontSize: 22, lineHeight: 1.15, color: ink }}>{NAMES[stateSel]}</div>
                    <div style={{ marginTop: 10, maxHeight: stacked ? "none" : 300, overflowY: stacked ? "visible" : "auto" }}>{listForState.map((p) => <Row key={p.i} p={p} />)}</div>
                </div>
            )}
            {!near && !stateSel && !msg && (
                <div style={{ ...serif, fontSize: 16, lineHeight: 1.4, color: accent }}>
                    Type your ZIP or tap a state to see churches near you.
                </div>
            )}
            {(near || stateSel) && <button onClick={reset} style={{ ...mono, alignSelf: "flex-start", background: "none", border: "none", padding: 0, color: ink, textDecoration: "underline", cursor: "pointer" }}>Show all churches</button>}
            {ctaLabel && ctaLink && (
                <a href={ctaLink} style={{ ...mono, display: "flex", alignItems: "center", justifyContent: "center", height: 48, background: ink, color: paper, textDecoration: "none", marginTop: 4 }}>{ctaLabel}</a>
            )}
        </div>
    )

    const tipLeft = act ? ((act.xy[0] - view[0]) / view[2]) * 100 : 0
    const tipTop = act ? ((act.xy[1] - view[1]) / view[3]) * 100 : 0

    const map = (
        <div style={{ position: "relative", flex: 1, minWidth: 0, width: "100%" }}>
            <svg viewBox={view.join(" ")} style={{ display: "block", width: "100%", height: "auto", aspectRatio: `${W} / ${H}`, touchAction: "pan-y", userSelect: "none" }}
                role="img" aria-label={`Map of ${feed.churches} churches Church Wear has made merch for`} onClick={(e) => { if (e.target === e.currentTarget) setActive(null) }}>
                <g>
                    {Object.entries(STATES).map(([s, d]) => (
                        <path key={s} d={d} fill={perState[s] ? (stateSel === s ? landActive : land) : paper} stroke={perState[s] ? paper : land}
                            strokeWidth={1 / zoom} vectorEffect="non-scaling-stroke" style={{ cursor: perState[s] ? "pointer" : "default", transition: "fill .2s" }}
                            onClick={() => pickState(s)} />
                    ))}
                </g>
                {origin && <circle cx={origin.xy[0]} cy={origin.xy[1]} r={10 / Math.sqrt(zoom)} fill="none" stroke={ink} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />}
                <g>
                    {pins.map((p) => (
                        <circle key={p.i} cx={p.xy[0]} cy={p.xy[1]} r={active === p.i ? r * 1.7 : r} fill={ink} stroke={paper} strokeWidth={1.2} vectorEffect="non-scaling-stroke"
                            style={{ cursor: "pointer" }} onMouseEnter={() => setActive(p.i)} onClick={(e) => { e.stopPropagation(); setActive(p.i) }} />
                    ))}
                </g>
            </svg>
            {act && tipLeft >= 0 && tipLeft <= 100 && tipTop >= 0 && tipTop <= 100 && (
                <div style={{ position: "absolute", left: `${Math.min(Math.max(tipLeft, 18), 82)}%`, top: `${tipTop}%`, transform: tipTop > 40 ? "translate(-50%, calc(-100% - 12px))" : "translate(-50%, 12px)",
                    background: paper, border: `1px solid ${ink}`, padding: "10px 12px", pointerEvents: "auto", maxWidth: 240, zIndex: 2 }}>
                    <div style={{ ...serif, fontSize: 15, lineHeight: 1.2, color: ink }}>{act.n}</div>
                    <div style={{ ...mono, fontSize: 10, color: accent, marginTop: 4 }}>{act.c}, {act.s}</div>
                    {act.w && <a href={act.w} target="_blank" rel="noopener nofollow" style={{ ...mono, fontSize: 10, color: ink, marginTop: 6, display: "inline-block" }}>{host(act.w)}</a>}
                </div>
            )}
        </div>
    )

    const q = query.trim().toLowerCase()
    const directory = full ? Object.keys(perState).sort((a, b) => NAMES[a].localeCompare(NAMES[b])).map((s) => ({
        s, list: pins.filter((p) => p.s === s && (!q || p.n.toLowerCase().includes(q) || p.c.toLowerCase().includes(q) || NAMES[s].toLowerCase().includes(q))).sort((a, b) => a.n.localeCompare(b.n)),
    })).filter((g) => g.list.length) : []

    return (
        <div ref={rootRef} style={{ ...style, display: "flex", flexDirection: "column", gap: full ? 56 : 0, background: paper, color: ink }}>
            <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", gap: stacked ? 20 : 40, alignItems: stacked ? "stretch" : "flex-start" }}>
                {map}
                {panel}
            </div>
            {full && (
                <div>
                    <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", justifyContent: "space-between", alignItems: stacked ? "stretch" : "flex-end", gap: 16, marginBottom: 24 }}>
                        <div style={{ ...serif, fontSize: stacked ? 32 : 48, lineHeight: 1.1, letterSpacing: "-0.04em" }}>Every church on the map</div>
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by church, city or state" aria-label="Search churches"
                            style={{ ...serif, height: 44, width: stacked ? "100%" : 320, padding: "0 14px", fontSize: 16, color: ink, background: paper, border: `1px solid ${ink}`, borderRadius: 0, outline: "none" }} />
                    </div>
                    <div style={stacked ? {} : { columnWidth: 260, columnGap: 40 }}>
                        {directory.map((g) => (
                            <div key={g.s} style={{ breakInside: "avoid", marginBottom: stacked ? 0 : 28 }}>
                                <div onClick={() => stacked && setOpen((o) => ({ ...o, [g.s]: !o[g.s] }))}
                                    style={{ ...mono, fontSize: 11, color: stacked ? ink : accent, padding: stacked ? "14px 0" : "0 0 8px", borderBottom: `1px solid ${stacked ? land : ink}`, display: "flex", justifyContent: "space-between", cursor: stacked ? "pointer" : "default" }}>
                                    <span>{NAMES[g.s]}</span>{stacked && <span style={{ color: accent }}>{g.list.length} {open[g.s] || q ? "−" : "+"}</span>}
                                </div>
                                {(!stacked || open[g.s] || q) && g.list.map((p) => (
                                    <div key={p.i} style={{ padding: "8px 0", borderBottom: `1px solid ${land}` }}>
                                        {p.w ? <a href={p.w} target="_blank" rel="noopener nofollow" style={{ ...serif, fontSize: 15, color: ink, textDecoration: "none" }}>{p.n}</a>
                                            : <span style={{ ...serif, fontSize: 15 }}>{p.n}</span>}
                                        <div style={{ ...mono, fontSize: 10, color: accent, marginTop: 2 }}>{p.c}</div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {!directory.length && <div style={{ ...serif, fontSize: 16, color: accent }}>No churches match that search.</div>}
                    </div>
                </div>
            )}
        </div>
    )
}

ChurchMap.defaultProps = { variant: "Section", ink: "#111111", paper: "#FFFFFF", land: "#EEEEEE", landActive: "#CCCCCC", accent: "#666666", ctaLabel: "", ctaLink: "" }

addPropertyControls(ChurchMap, {
    variant: { type: ControlType.Enum, title: "Variant", options: ["Section", "Full page"], defaultValue: "Section" },
    ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "" },
    ctaLink: { type: ControlType.Link, title: "Button Link" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    paper: { type: ControlType.Color, title: "Background", defaultValue: "#FFFFFF" },
    land: { type: ControlType.Color, title: "States", defaultValue: "#EEEEEE" },
    landActive: { type: ControlType.Color, title: "Selected", defaultValue: "#CCCCCC" },
    accent: { type: ControlType.Color, title: "Muted Text", defaultValue: "#666666" },
    bodyFont: { type: ControlType.Font, title: "Body Font", controls: "basic", defaultFontType: "sans-serif" },
    labelFont: { type: ControlType.Font, title: "Label Font", controls: "basic", defaultFontType: "monospace" },
})
