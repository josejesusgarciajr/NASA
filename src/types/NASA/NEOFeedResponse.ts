// NASA NEO Feed API Types

export type NEOFeedLinks = {
  next: string;
  previous: string;
  self: string;
};

export type NEODiameter = {
  estimated_diameter_min: number;
  estimated_diameter_max: number;
};

export type NEOEstimatedDiameter = {
  kilometers: NEODiameter;
  meters: NEODiameter;
  miles: NEODiameter;
  feet: NEODiameter;
};

export type NEORelativeVelocity = {
  kilometers_per_second: string;
  kilometers_per_hour: string;
  miles_per_hour: string;
};

export type NEOMissDistance = {
  astronomical: string;
  lunar: string;
  kilometers: string;
  miles: string;
};

export type NEOCloseApproachData = {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: NEORelativeVelocity;
  miss_distance: NEOMissDistance;
  orbiting_body: string;
};

export type NEOObjectLinks = {
  self: string;
};

export type NEOObject = {
  links: NEOObjectLinks;
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: NEOEstimatedDiameter;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: NEOCloseApproachData[];
  is_sentry_object: boolean;
};

export type NEOFeedResponse = {
  links: NEOFeedLinks;
  element_count: number;
  near_earth_objects: {
    [date: string]: NEOObject[];
  };
};