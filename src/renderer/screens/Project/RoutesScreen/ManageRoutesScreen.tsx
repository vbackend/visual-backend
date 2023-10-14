import React, { useState } from 'react';
import { Route, RouteNode } from '@/shared/models/route';
import CreateRouteModal from '../CreateRouteModal';
import RouteRow from '../RouteRow';
import Margin from '@/renderer/components/general/Margin';

type ManageRoutesScreenProps = {
  rootNode: RouteNode;
};
function ManageRoutesScreen({ rootNode }: ManageRoutesScreenProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [createModalOpen, setCreateOpenModal] = useState(false);

  return (
    <>
      {createModalOpen && (
        <CreateRouteModal
          setCreateModalOpen={setCreateOpenModal}
          selectedRoute={selectedRoute!}
        />
      )}

      <div className="routesContainer">
        <div className="headerContainer">
          <h3>Routes</h3>
        </div>
        <div className="routesContainer">
          <RouteRow
            parent={null}
            node={rootNode!}
            level={0}
            setCreateModalOpen={setCreateOpenModal}
            setSelectedRoute={setSelectedRoute}
          />
        </div>
      </div>
    </>
  );
}

export default ManageRoutesScreen;
