import axios from 'axios';
import * as c from '../helpers/config';

const Login = ({mail, password}) =>
  new Promise((resolve, reject) => {
    if (mail && password) {
      axios
        .get(`${c.BASE_URL}/User/Login.php?mail=${mail}&password=${password}`, {
          headers: {
            accept: 'application/json',
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    }
  });

const DeleteAccount = token =>
  new Promise((resolve, reject) => {
    axios
      .post(
        `${c.BASE_URL}/User/Delete.php`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });

const Cities = () =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}${c.PARAMETERS}/Cities.php`,
    };
    axios(config)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });

const Skills = token =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}${c.PARAMETERS}/Skills.php`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const Restaurants = (token, city) =>
  new Promise((resolve, reject) => {
    console.log("👉 API appelée avec ville =", city); 
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/Restaurant/GetAll.php?ville=${city}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(config)
      .then(function (response) {
        console.log("👉 Réponse brute de l’API :", response.data); 
        resolve(response.data);
      })
      .catch(function (error) {
        console.error("❌ Erreur API axios :", error);
        reject(error);
      });
  });   

const RestaurantById = (token, id) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/Restaurant/GetPlatsByResto.php?id=${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const Languages = token =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}${c.PARAMETERS}/Languages.php`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const VisitType = (token, ville) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}${c.PARAMETERS}/TypeVisits.php?city=${ville}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const VisitTypeTransfert = (token, ville) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}${c.PARAMETERS}/TypeVisitsTransfert.php?city=${ville}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }; 
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const TransfertHistory = (token) =>
  new Promise((resolve, reject) => {
    var config = {
      method: "get",
      url: `${c.BASE_URL}/Transfert/GetAllTransfert.php`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        console.error("❌ Erreur API TransfertHistory:", error);
        reject(error);
      });
  });

const BabySitterHistory = (token, id) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/BabySitter/GetAll.php?id=${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const GuideHistory = (token, id) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/Guide/GetAll.php?id=${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  
const BabySitterHistoryDetails = (token, id) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/BabySitter/GetById.php?id=${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const RestoHistoryDetails = (token, id) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/Restaurant/GetReservation.php?id=${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const GuideHistoryDetails = (token, id) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/Guide/GetById.php?id=${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const TravelHistoryDetails = (token, id) =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}/Transfert/GetById.php?id=${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        console.error("❌ Erreur API TravelHistoryDetails:", error);
        reject(error);
      });
  });

const getAllParams = token =>
  new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: `${c.BASE_URL}${c.PARAMETERS}/Global.php`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }; 
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

const SetBabySetting = (obj, token) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/BabySitter/Set.php`, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });

const LostPass = obj =>
  new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/User/LostPassword.php`, obj)
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });

const SetGuide = (obj, token) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/Guide/Set.php`, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });

// ============================
// 🌍 DESTINATIONS / ACTIVITÉS / PACKAGES
// ============================
export const GetDestinations = (token) =>
  new Promise((resolve, reject) => {
    axios
      .get(`${c.BASE_URL}/Destinations/GetAll.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });      
    
export const GetActivitiesByDestination = (token, destination_id) =>
  new Promise((resolve, reject) => {
    axios
      .get(`${c.BASE_URL}/Activities/GetByDestination.php?destination_id=${destination_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });

export const GetPackagesByActivity = (token, activity_id) =>
  new Promise((resolve, reject) => {
    axios
      .get(`${c.BASE_URL}/Packages/GetByActivity.php?activity_id=${activity_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });

export const setReservation = (data) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/Reservations/Set.php`, data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });

async function finishProcess() {
  if (cardError.number === "incomplete" && !useOtherCard) {
    Toast.show({ type: "error", text1: "Erreur", text2: "Numéro de carte invalide" });
    return;
  }
  setIsLoading(true);
  try {
    const payload = {
      user_id: user?.id || null,
      package_id: packageData?.id,
      date_selected: selectedDate,
      adult_count: route.params?.adultCount || 1,
      child_count: route.params?.childCount || 0,
      total_price: parseFloat(total),
    };
    console.log("📤 Envoi de la réservation :", payload);
    const res = await axios.post(
      "https://noussoukitravel.com/api/Reservations/Create.php",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("📦 Réponse API :", res.data);
    if (res.data.status === "success") {
      setIsLoading(false);
      hideModal();
      setSuccessVisible(true);
    } else {
      setIsLoading(false);
      Alert.alert("Erreur", res.data.message || "Impossible d'enregistrer la réservation");
    }
  } catch (err) {
    console.error("❌ Erreur réseau :", err);
    setIsLoading(false);
    Alert.alert("Erreur", "Une erreur s'est produite lors de l'enregistrement.");
  }
}

export const GetPays = (token) =>
  new Promise((resolve, reject) => {
    axios
      .get(`${c.BASE_URL}/Pays/GetAll.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });    
  
export const GetTypesVisites = () =>
  new Promise((resolve, reject) => {
    axios
      .get(`${c.BASE_URL}/Guide/GetTypesVisites.php`, {
        headers: { Accept: "application/json" },
      })
      .then((response) => {
        console.log("📌 TypesVisites reçus :", response.data);
        if (response.data.status === "success") {
          resolve({
            status: "success",
            list: response.data.types,
          });
        } else {
          resolve({
            status: "error",
            list: [],
          });
        }
      })
      .catch((error) => {
        console.log("❌ Erreur TypesVisites :", error);
        reject(error);
      });
  });

export const SetTransfert = (obj, token) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/Transfert/SetTransfert.php`, JSON.stringify(obj), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });

export const GetTransfertById = (id, token) =>
  new Promise((resolve, reject) => {
    axios
      .get(`${c.BASE_URL}/Transfert/GetTransfertById.php?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });

export const AllReservationsHistory = async (token, userid) => {
  try {
    const response = await fetch(
      `${c.BASE_URL}/History/api.php?action=AllReservationsHistory&userid=${userid}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      return { status: "error", message: `HTTP ${response.status}`, data: [] };
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("❌ JSON invalide :", text);
      return { status: "error", message: "JSON invalide", data: [] };
    }
  } catch (error) {
    console.error("❌ Erreur API Historique :", error);
    return { status: "error", message: error.message, data: [] };
  }
};

export const AllReservationDetails = async (token, type, id) => {
  try {
    const res = await fetch(
      `${c.BASE_URL}/History/api.php?action=ReservationDetails&type=${type}&id=${id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const json = await res.json();
    if (json.status === "success" && json.data) {
      console.log(`✅ Données ${type} récupérées:`, json.data);
      return json.data;
    }
    console.warn("⚠️ Erreur API:", json.message || "Réponse vide");
    return null;
  } catch (error) {
    console.error("❌ Erreur AllReservationDetails:", error);
    return null;
  }
};

export const SetNoteAvis = async (token, obj) => {
  try {
    const res = await fetch(
      `${c.BASE_URL}/History/api.php?action=SetNoteAvis`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      }
    );
    if (!res.ok) {
      return { status: "error", message: `HTTP ${res.status}` };
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("❌ JSON invalide :", text);
      return { status: "error", message: "JSON invalide" };
    }
  } catch (error) {
    console.error("❌ Erreur SetNoteAvis :", error);
    return { status: "error", message: error.message };
  }
};

export const AllReviews = async (token) => {
  try {
    const res = await fetch(`${c.BASE_URL}/History/api.php?action=AllReviews`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    if (json.status === "success") {
      return json.data;
    }
    return [];
  } catch (e) {
    console.error("❌ Erreur AllReviews :", e);
    return [];
  }
};

const SetBabySettingPayment = (obj, token) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/Payment/Set.php`, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });

const SetBabyNote = (obj, token) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/BabySitter/SetAvis.php `, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });

export const RestaurantRequest = (obj, token) =>
  new Promise((resolve, reject) => {
    console.log("➡️ [RestaurantRequest] payload:", obj);
    axios
      .post(`${c.BASE_URL}/Restaurant/Set.php`, JSON.stringify(obj), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((response) => {
        console.log("⬅️ [RestaurantRequest] response:", response?.data);
        resolve(response.data);
      })
      .catch((err) => {
        console.log("❌ [RestaurantRequest] error:", err?.response?.data || err?.message);
        reject(err);
      });
  });

const SignUp = user =>
  new Promise((resolve, reject) => {
    if (user) {
      axios
        .post(`${c.BASE_URL}/User/Create.php`, user)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    }
  });

const UpdatePassword = (obj, token) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/User/updatePassword.php`, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const UpdateProfile = (obj, token) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${c.BASE_URL}/User/Update.php`, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// ==========================================
// 🔄 CORRECTION/AJOUT : SUIVI NOUVELLES APIS
// ==========================================

const UpdateStatusBooking = (token, id, type, status, extra = {}) =>
  new Promise((resolve, reject) => {
    axios
      .post(
        `${c.BASE_URL}/History/api.php?action=UpdateStatusBooking`,
        { id: id, type: type, statut_prestataire: status, ...extra },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });

const ExtendBabysittingMission = (token, payload) =>
  new Promise((resolve, reject) => {
    axios
      .post(
        `${c.BASE_URL}/History/api.php?action=ExtendBabysittingMission`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });

const CancelReservation = (token, type, id) =>
  new Promise((resolve, reject) => {
    axios
      .post(
        `${c.BASE_URL}/History/api.php?action=CancelReservation`,
        { id, type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });

export {
  Login,
  SignUp,
  UpdateProfile,
  UpdatePassword,
  getAllParams,
  Cities,
  Languages,
  Skills,
  SetBabySetting,
  SetBabySettingPayment,
  BabySitterHistory,
  BabySitterHistoryDetails,
  SetBabyNote,
  VisitType,
  SetGuide,
  GuideHistory,
  GuideHistoryDetails,
  Restaurants,
  RestaurantById,
  DeleteAccount,
  RestoHistoryDetails,
  LostPass,
  finishProcess,
  TransfertHistory,
  TravelHistoryDetails,
  VisitTypeTransfert,
  // Nouvelles exports ajoutées
  UpdateStatusBooking,
  ExtendBabysittingMission,
  CancelReservation,
};