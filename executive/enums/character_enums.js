/* Executive - executive/enums/character_enums.js
   This defines enums for indexing character objects (arrays) as used within The Political Process. */

module.exports = {
   candidate: {
      caucusParty: 0, /* Not actually the party! Should be renamed before release. */
      gender: 1,
      age: 2,
      ethnicity: 3,
      firstName: 4,
      lastName: 5,
      
      policyPositions: {
         minWage: 8,
         govAid: 46,
         lowMain: 9,
         midMain: 10,
         upperMain: 11,
         ecoGrowth: 19,
         flatTax: 167,

         gunCheck: 12,
         gunControl: 40,
         banHighCap: 41,
         assaultWeaponBan: 42,
         deadlyForce: 16,

         commColl: 23,
         preSchool: 24,
         teachPay: 25,
         
         citPath: 48,
         tightBorder: 47,
         expandVisas: 49,

         labelGMO: 38,

         incGap: 15,
         gayMarriage: 13,
         marBenefit: 43,
         recUse: 44,
         illegalAbortion: 14,
         proChoice: 17,
         pregClinic: 39,
         cutStamps: 18,
         socSecValue: 168,

         moreSolar: 26,
         moreWind: 27,
         moreGas: 28,
         moreOil: 29,
         moreNuclear: 30,
         moreCoal: 31,

         envGrowth: 20,
         globalWHuman: 21,
         limitPow: 22,
         climatePol: 32,
         conEm: 35,
         solWind: 33,
         altFuel: 34,
         oilLand: 36,
         autoStand: 37,
         reduceEm: 45,

         mainMil: 50,

         uniHealth: 165,
         expandMedicaid: 166,
      },

      partyInnerCaucus: 96,
      candidateId: 111,
      traits: 122,
      stateId: 127,
      jobs: 129,
      politicalPoints: 134,
      campaignFunds: 136,
      nameRecognition: 146,
      jobHistory: 169,
      extendedAttribs: 178
   },
   staff: {
      ethnicity: 0,
      gender: 1,
      age: 2,
      firstName: 3,
      lastName: 4,
      extendedAttribs: 43
   },
   history: {
      party: 0,
      gender: 1,
      age: 2,
      ethnicity: 3,
      firstName: 4,
      lastName: 5,
      partyCaucus: 25,
      stateId: 39,
      jobHistory: 42,
      extendedAttribs: 50
   }
};