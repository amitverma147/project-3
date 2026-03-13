export interface LocationData {
  name: string;
  code: string;
  states: {
    name: string;
    code: string;
    cities: string[];
  }[];
}

export const locationData: LocationData[] = [
  {
    name: "India",
    code: "IN",
    states: [
      {
        name: "Rajasthan",
        code: "RJ",
        cities: ["Jaipur", "Udaipur", "Jodhpur", "Ajmer", "Kota"],
      },
      {
        name: "Maharashtra",
        code: "MH",
        cities: ["Mumbai", "Pune", "Nagpur", "Nashik"],
      },
      {
        name: "Gujarat",
        code: "GJ",
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      },
      {
        name: "Karnataka",
        code: "KA",
        cities: ["Bengaluru", "Mysuru", "Mangalore"],
      },
      {
        name: "Tamil Nadu",
        code: "TN",
        cities: ["Chennai", "Coimbatore", "Madurai"],
      },
      {
        name: "Telangana",
        code: "TS",
        cities: ["Hyderabad", "Warangal"],
      },
      {
        name: "Uttar Pradesh",
        code: "UP",
        cities: ["Lucknow", "Kanpur", "Varanasi", "Agra"],
      },
      {
        name: "West Bengal",
        code: "WB",
        cities: ["Kolkata", "Howrah", "Durgapur"],
      },
      {
        name: "Madhya Pradesh",
        code: "MP",
        cities: ["Bhopal", "Indore", "Gwalior"],
      },
      {
        name: "Kerala",
        code: "KL",
        cities: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
      },
      {
        name: "Punjab",
        code: "PB",
        cities: ["Amritsar", "Ludhiana"],
      },
      {
        name: "Haryana",
        code: "HR",
        cities: ["Gurgaon", "Faridabad", "Panipat"],
      },
      {
        name: "Bihar",
        code: "BR",
        cities: ["Patna", "Gaya", "Muzaffarpur"],
      },
      {
        name: "Odisha",
        code: "OD",
        cities: ["Bhubaneswar", "Cuttack"],
      },
      {
        name: "Assam",
        code: "AS",
        cities: ["Guwahati", "Silchar"],
      },
      {
        name: "Goa",
        code: "GA",
        cities: ["Panaji", "Margao"],
      },
      {
        name: "Uttarakhand",
        code: "UK",
        cities: ["Dehradun", "Haridwar"],
      },
      {
        name: "Himachal Pradesh",
        code: "HP",
        cities: ["Shimla", "Manali"],
      },
      {
        name: "Jharkhand",
        code: "JH",
        cities: ["Ranchi", "Jamshedpur"],
      },
      {
        name: "Chhattisgarh",
        code: "CG",
        cities: ["Raipur", "Bilaspur"],
      },
      {
        name: "Tripura",
        code: "TR",
        cities: ["Agartala"],
      },
      {
        name: "Sikkim",
        code: "SK",
        cities: ["Gangtok"],
      },
      {
        name: "Meghalaya",
        code: "ML",
        cities: ["Shillong"],
      },
      {
        name: "Manipur",
        code: "MN",
        cities: ["Imphal"],
      },
      {
        name: "Nagaland",
        code: "NL",
        cities: ["Kohima", "Dimapur"],
      },
      {
        name: "Mizoram",
        code: "MZ",
        cities: ["Aizawl"],
      },
      {
        name: "Arunachal Pradesh",
        code: "AR",
        cities: ["Itanagar", "Tawang"],
      },
    ],
  },
];
