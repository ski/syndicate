use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct AgentState {
    pub burn_balance: f64,
    pub gov_balance: f64,
    pub epoch: u64,
}

#[wasm_bindgen]
pub struct SyndicateAgent {
    user_id: String,
    state: AgentState,
}

#[wasm_bindgen]
impl SyndicateAgent {
    #[wasm_bindgen(constructor)]
    pub fn new(user_id: String) -> Self {
        Self {
            user_id,
            state: AgentState {
                burn_balance: 0.0,
                gov_balance: 100.0, // Initial GOV stake
                epoch: 0,
            },
        }
    }

    pub fn receive_ubi(&mut self, amount: f64, current_epoch: u64) {
        // Demurrage Implementation: 
        // If the epoch has advanced, unspent burn from the previous epoch is lost.
        if current_epoch > self.state.epoch {
            self.state.burn_balance = 0.0;
            self.state.epoch = current_epoch;
        }
        self.state.burn_balance += amount;
    }

    /// OCap-style transaction: The agent calculates if it can afford a priority bid.
    /// In a full system, this would return a signed capability invocation.
    pub fn calculate_bid(&self, urgency: f64) -> f64 {
        if self.state.burn_balance <= 0.0 {
            return 0.0;
        }
        
        // Strategy: Spend more as urgency or epoch-end approaches
        let bid = self.state.burn_balance * (urgency * 0.2).min(0.9);
        bid.max(1.0)
    }

    pub fn apply_burn(&mut self, amount: f64) -> bool {
        if self.state.burn_balance >= amount {
            self.state.burn_balance -= amount;
            true
        } else {
            false
        }
    }

    pub fn get_status_json(&self) -> String {
        serde_json::to_string(&self.state).unwrap_or_else(|_| "{}".to_string())
    }

    /// Expose the agent's user identifier to JS callers.
    pub fn user_id(&self) -> String {
        self.user_id.clone()
    }
}