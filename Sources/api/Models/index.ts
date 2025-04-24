import { Vehicules } from "./Vehicules";
import { Elements } from "./Elements";
import { Users } from "./Users";
import { Gardes } from "./Garde";
import { setupAssociations } from "./setupAssociations";

// On déclare toutes les relations
setupAssociations();

export { Vehicules, Elements, Users, Gardes };
