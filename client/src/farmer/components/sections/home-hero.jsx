import React, { useEffect, useRef,useContext } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { gsap } from "gsap"
import { socketContext } from "../../../contexts/socketContext"
import { useTranslation } from "../../../consumer/i18n/config.jsx";


export default function HomeHero() {
   const titleRef = useRef(null)
   const subRef = useRef(null)
   const ctaRef = useRef(null)
   const [account, setAccount] = React.useState(null);
   const [requestData, setRequestData] = React.useState(null);
   const [showRequestModal, setShowRequestModal] = React.useState(false);
   const [price, setPrice] = React.useState("");
   const { t } = useTranslation();



   const { socket, setSocket } = useContext(socketContext);
    // Socket connection disabled for demo
    // useEffect(() => {
    //   if (!socket) {
    //     const sock = io("http://localhost:5000");
    //     setSocket(sock);
    //   }
    // }, []);

    // Socket functionality disabled for demo
    // useEffect(() => {
    //   if (!socket) return;
    //   const doConnect = async () => {
    //     const user = JSON.parse(localStorage.getItem('user') || '{}');
    //     const acc = user.email || `farmer_${Date.now()}`;
    //     setAccount(acc);
    //     socket.emit("register", acc);
    //   };
    //   doConnect();
    //   const handleNewRequest = (data) => {
    //     setRequestData(data);
    //     setShowRequestModal(true);
    //   };
    //   const handleAcceptRequest = (data) => {
    //     handlePayment(data.price, data.farmer, data.tokenId, data.amountToken, data.buyer);
    //   };
    //   socket.on("new_request", handleNewRequest);
    //   socket.on("accept_request", handleAcceptRequest);
    //   socket.on("payment_success", (data) => {
    //     toast.success("Payment successful!");
    //   });
    //   return () => { socket.disconnect(); };
    // }, [socket]);

  useEffect(() => {
    // Get user from localStorage for display purposes
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAccount(user.email || 'demo@agrichain.com');
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
    tl.fromTo(titleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo(subRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2")
      .fromTo(ctaRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.1")
  }, [])

  return (
    <div className="pt-24 md:pt-28 pb-12 md:pb-16 px-4 md:px-8 lg:px-12 bg-[linear-gradient(to_bottom,transparent,rgba(16,24,16,0.08))]">
      <div className="mx-auto max-w-6xl">
        <h1 ref={titleRef} className="text-2xl md:text-4xl font-bold whitespace-nowrap">
          {t("farmer.home.title")}
        </h1>
        <p ref={subRef} className="mt-3 md:mt-4 text-muted-foreground max-w-2xl text-pretty leading-relaxed">
          {t("farmer.home.subtitle")}
        </p>

        <div ref={ctaRef} className="mt-6 flex items-center gap-3">
          <a href="#produce">
            <Button   className="cursor-pointer bg-emerald-600 hover:bg-emerald-700">{t("farmer.home.cta.addProduce")}</Button>
          </a>
          <a href="#market">
            <Button className="cursor-pointer " variant="outline">{t("farmer.home.cta.viewRequests")}</Button>
          </a>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-background/60 border-emerald-200/30">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t("farmer.home.feature1.label")}</div>
              <div className="mt-1 font-semibold">{t("farmer.home.feature1.value")}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-background/60 border-emerald-200/30">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t("farmer.home.feature2.label")}</div>
              <div className="mt-1 font-semibold">{t("farmer.home.feature2.value")}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-background/60 border-emerald-200/30">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t("farmer.home.feature3.label")}</div>
              <div className="mt-1 font-semibold">{t("farmer.home.feature3.value")}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      {showRequestModal && requestData && (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
       {/* Close button */}
       <button
         onClick={() => setShowRequestModal(false)}
         className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-700"
       >
         ✕
       </button>

       <h2 className="text-xl font-bold mb-4">{t("farmer.home.modal.newBuyRequest")}</h2>

       <div className="space-y-2 text-sm text-gray-700">
         <p><strong>{t("farmer.home.modal.buyer")}</strong> {requestData.buyer}</p>
         <p><strong>{t("farmer.home.modal.batchId")}</strong> {requestData.tokenId}</p>
         <p><strong>{t("farmer.home.modal.quantity")}</strong> {requestData.amountToken}</p>
       </div>

       {/* Price Input */}
       <div className="mt-4">
         <label className="block text-sm font-medium text-gray-700 mb-1">
           {t("farmer.home.modal.enterPrice")}
         </label>
         <input
           type="number"
           value={price}
           onChange={(e) => setPrice(e.target.value)}
           placeholder="e.g. 250"
           className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
         />
       </div>

       {/* Accept Button */}
       <button
         onClick={() => {
           if (!price || price <= 0) {
             toast.error(t("farmer.home.modal.invalidPrice"));
             return;
           }
           socket.emit("accept_request", {
             ...requestData,
             farmer: account,
             price: Number(price),
           });
           setShowRequestModal(false);
         }}
         className="mt-6 w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg"
       >
         {t("farmer.home.modal.acceptRequest")}
       </button>
     </div>
   </div>
 )}


    </div>
  )
}