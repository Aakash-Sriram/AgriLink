from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import googlemaps
from django.conf import settings
from .models import Vehicle, Route
from marketplace.models import Order

class RouteOptimizationService:
    def __init__(self):
        self.gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
    
    def get_distance_matrix(self, locations):
        """Get distance matrix from Google Maps API"""
        matrix = self.gmaps.distance_matrix(
            locations,
            locations,
            mode="driving",
            units="metric"
        )
        
        distances = []
        for row in matrix['rows']:
            distance_row = []
            for element in row['elements']:
                distance_row.append(element['distance']['value'])
            distances.append(distance_row)
        
        return distances
    
    def optimize_route(self, orders, vehicle):
        """Optimize delivery route for given orders"""
        # Extract locations from orders
        locations = [order.listing.location for order in orders]
        locations.insert(0, vehicle.current_location)  # Add vehicle's current location
        
        # Get distance matrix
        distance_matrix = self.get_distance_matrix(locations)
        
        # Create routing model
        manager = pywrapcp.RoutingIndexManager(len(locations), 1, 0)
        routing = pywrapcp.RoutingModel(manager)
        
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return distance_matrix[from_node][to_node]
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add Distance constraint
        dimension_name = 'Distance'
        routing.AddDimension(
            transit_callback_index,
            0,  # no slack
            3000000,  # maximum distance in meters
            True,  # start cumul to zero
            dimension_name
        )
        
        # Set first solution strategy
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        
        # Solve the problem
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            return self._extract_route(manager, routing, solution, locations)
        return None
    
    def _extract_route(self, manager, routing, solution, locations):
        """Extract the optimized route from solution"""
        route = []
        index = routing.Start(0)
        
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            route.append({
                'location': locations[node_index],
                'distance': solution.Value(routing.GetArcCostForVehicle(index, routing.NextVar(index), 0))
            })
            index = solution.Value(routing.NextVar(index))
        
        return route 