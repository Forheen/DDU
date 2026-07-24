import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { RequireAuth } from './auth/RequireAuth.jsx'
import { PORTAL } from './models/index.js'

import { FieldLayout } from './layouts/FieldLayout.jsx'
import { AdminLayout } from './layouts/AdminLayout.jsx'

import { Login } from './pages/Login.jsx'
import { Me } from './pages/field/Me.jsx'
import { Dashboard } from './pages/field/Dashboard.jsx'
import { BlocksList } from './pages/field/BlocksList.jsx'
import { BlockDetail } from './pages/field/BlockDetail.jsx'
import { VatikaDetail } from './pages/field/VatikaDetail.jsx'
import { ProductProfile } from './pages/field/ProductProfile.jsx'
import { Stage1Chooser } from './pages/field/Stage1Chooser.jsx'
import { Stage1MarketForm } from './pages/field/Stage1MarketForm.jsx'
import { Stage1InstitutionForm } from './pages/field/Stage1InstitutionForm.jsx'
import { Stage2Wizard } from './pages/field/Stage2Wizard.jsx'
import { CostEconomicsPage } from './pages/field/CostEconomicsPage.jsx'
import { Stage3Wizard } from './pages/field/Stage3Wizard.jsx'
import { DDUSummary } from './pages/field/DDUSummary.jsx'
import { MitraView } from './pages/field/MitraView.jsx'
import { DhawakView } from './pages/field/DhawakView.jsx'

import { AdminDashboard } from './pages/admin/AdminDashboard.jsx'
import { AdminBlocks } from './pages/admin/AdminBlocks.jsx'
import { AdminBlockDetail } from './pages/admin/AdminBlockDetail.jsx'
import { AdminDDUDetail } from './pages/admin/AdminDDUDetail.jsx'
import { AdminUsers } from './pages/admin/AdminUsers.jsx'
import { AdminProducts } from './pages/admin/AdminProducts.jsx'
import { AdminAssignments } from './pages/admin/AdminAssignments.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <RequireAuth portal={PORTAL.FIELD}>
                <FieldLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/me" element={<Me />} />
            <Route path="/mitra" element={<MitraView />} />
            <Route path="/dhawak" element={<DhawakView />} />
            <Route path="/stage1/start" element={<Stage1Chooser />} />
            <Route path="/blocks" element={<BlocksList />} />
            <Route path="/blocks/:blockId" element={<BlockDetail />} />
            <Route path="/blocks/:blockId/stage1/market/new" element={<Stage1MarketForm scope="block" />} />
            <Route path="/blocks/:blockId/stage1/institution/new" element={<Stage1InstitutionForm scope="block" />} />
            <Route path="/vatikas/:vatikaId" element={<VatikaDetail />} />
            <Route path="/vatikas/:vatikaId/stage1/market/new" element={<Stage1MarketForm scope="vatika" />} />
            <Route path="/vatikas/:vatikaId/stage1/institution/new" element={<Stage1InstitutionForm scope="vatika" />} />
            <Route path="/vatikas/:vatikaId/products/:productId" element={<ProductProfile />} />
            <Route path="/vatikas/:vatikaId/products/:productId/stage2" element={<Stage2Wizard />} />
            <Route path="/vatikas/:vatikaId/products/:productId/cost-economics" element={<CostEconomicsPage />} />
            <Route path="/vatikas/:vatikaId/products/:productId/stage3" element={<Stage3Wizard />} />
            <Route path="/vatikas/:vatikaId/products/:productId/summary" element={<DDUSummary />} />
          </Route>

          <Route
            element={
              <RequireAuth portal={PORTAL.ADMIN}>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/blocks" element={<AdminBlocks />} />
            <Route path="/admin/blocks/:blockId" element={<AdminBlockDetail />} />
            <Route path="/admin/ddu/:groupId" element={<AdminDDUDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/assignments" element={<AdminAssignments />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
