import { Vehicules } from "./Vehicules";
import { Elements } from "./Elements";
import { Sections } from "./Sections";
import { Users } from "./Users";
import { Gardes } from "./Garde";
import { setupAssociations } from "./setupAssociations";

// On déclare toutes les relations
setupAssociations();

export { Vehicules, Elements, Sections, Users, Gardes };
