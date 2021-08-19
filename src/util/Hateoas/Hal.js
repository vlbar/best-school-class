import Hateoas from "./Hateoas";

//Href extracter for objects structured by hal principle
export default class Hal {
  //extracts link from hal _links section
  getHref(halData, linkName) {
    return halData._links[linkName]?.href;
  }

  //extracts collection from hal _embedded section
  getCollection(halData, collectionName) {
    return halData._embedded ? halData._embedded[collectionName] : null;
  }
}
