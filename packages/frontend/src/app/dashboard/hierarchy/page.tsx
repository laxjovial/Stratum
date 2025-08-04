import OrgChart from '../../../components/org-chart';

export default function HierarchyPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Organizational Hierarchy</h1>
      <p className="mb-6 text-gray-600">
        Drag and drop departments to define their reporting structure.
      </p>
      <div className="p-4 bg-white rounded-lg shadow">
        <OrgChart />
      </div>
    </div>
  );
}
