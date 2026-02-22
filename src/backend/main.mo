import List "mo:core/List";
import Map "mo:core/Map";
import Bool "mo:core/Bool";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// SETUP ACTOR WITH DATA MIGRATION
actor {
  // Setup Access Control and Storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type UploadReference = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    contentType : Text;
    size : Nat;
    timestamp : Time.Time;
    owner : Principal;
  };

  let uploads = Map.empty<Principal, List.List<UploadReference>>();
  let logs = Map.empty<Principal, List.List<LogEntry>>();
  let questions = Map.empty<Principal, List.List<Question>>();

  // Log Entry Types
  type LogEntry = {
    id : Text;
    timestamp : Time.Time;
    title : ?Text;
    notes : Text;
    mileage : ?Int;
    owner : Principal;
  };

  // Question Types
  type Question = {
    id : Text;
    questionText : Text;
    timestamp : Time.Time;
    status : QuestionStatus;
    adminReply : ?Text;
    owner : Principal;
  };

  type QuestionStatus = {
    #open;
    #answered;
  };

  // Pre-Trip Checklist types and storage
  public type ChecklistSection = {
    title : Text;
    items : [ChecklistItem];
  };

  public type ChecklistItem = {
    id : Text;
    name : Text;
    prompt : Text;
    defaultChecked : Bool;
  };

  public type SavedChecklist = {
    items : [ChecklistItem];
    checked : [(Text, Bool)];
    signature : Text;
    timestamp : Time.Time;
    driverName : Text;
    driverId : Principal;
  };

  public type PreTripChecklist = {
    signature : Text;
    timestamp : Time.Time;
    driverName : Text;
    driverId : Principal;
    checked : [(Text, Bool)];
  };

  public type ChecklistConfig = { sections : [ChecklistSection] };

  public type Checklist = {
    config : ChecklistConfig;
    checklist : PreTripChecklist;
  };

  module LogEntry {
    public func compareByTime(log1 : LogEntry, log2 : LogEntry) : Order.Order {
      Int.compare(log1.timestamp, log2.timestamp);
    };

    public func compareByMileage(log1 : LogEntry, log2 : LogEntry) : Order.Order {
      switch (log1.mileage, log2.mileage) {
        case (?m1, ?m2) { Int.compare(m1, m2) };
        case (?_, null) { #less };
        case (null, ?_) { #greater };
        case (null, null) { #equal };
      };
    };
  };

  module Question {
    public func compareByTime(q1 : Question, q2 : Question) : Order.Order {
      Int.compare(q1.timestamp, q2.timestamp);
    };
  };

  // ================= User Onboarding (Local Authentication Flow) ==================

  // Track registered users separately to enable self-registration
  let registeredUsers = Map.empty<Principal, Bool>();

  // Register a new user with display name (local authentication onboarding)
  public shared ({ caller }) func registerUser(displayName : Text) : async () {
    // Validate display name
    if (displayName.size() == 0) {
      Runtime.trap("Display name cannot be empty");
    };

    // Check if already registered
    switch (registeredUsers.get(caller)) {
      case (?true) {
        Runtime.trap("User already registered");
      };
      case _ {
        // Register user
        registeredUsers.add(caller, true);

        // Create user profile
        let profile : UserProfile = {
          name = displayName;
        };
        userProfiles.add(caller, profile);

        // Note: We cannot call AccessControl.assignRole here as it's admin-only
        // The AccessControl module will need to be queried via getUserRole
        // which returns #guest for unregistered users
      };
    };
  };

  // Update user profile (for already registered users or during registration)
  public shared ({ caller }) func updateUserProfile(displayName : Text) : async () {
    // Validate display name
    if (displayName.size() == 0) {
      Runtime.trap("Display name cannot be empty");
    };

    // Check if user is registered
    switch (registeredUsers.get(caller)) {
      case (?true) {
        let profile : UserProfile = {
          name = displayName;
        };
        userProfiles.add(caller, profile);
      };
      case _ {
        Runtime.trap("User not registered. Please register first.");
      };
    };
  };

  func isRegisteredUser(principal : Principal) : Bool {
    switch (registeredUsers.get(principal)) {
      case (?true) { true };
      case _ { false };
    };
  };

  // ================= Checklist Feature Extension ==================
  // ANONYMOUS ACCESS: Allow anyone (including guests) to get checklist config
  public query ({ caller }) func getChecklistConfig() : async ChecklistConfig {
    // No authorization check - anonymous access allowed per implementation plan
    {
      sections = getChecklistSections();
    };
  };

  func getChecklistSections() : [ChecklistSection] {
    [
      {
        title = "RESTRAINT & CARGO EQUIPMENT";
        items = [
          {
            id = "straps";
            name = "Surface Inspection: Straps";
            prompt = "Check for cuts, worn stitching, frayed edges, and hardware damage.";
            defaultChecked = false;
          },
          {
            id = "sliders";
            name = "Surface Inspection: Sliders";
            prompt = "Check for cracks, bends, or other damage; ensure they lock securely.";
            defaultChecked = false;
          },
          {
            id = "pallet_jack";
            name = "Check Pallet Jack";
            prompt = "Inspect for worn wheels, maintain tire pressure, and ensure proper storage.";
            defaultChecked = false;
          },
          {
            id = "tie_downs";
            name = "Check Tie-Downs";
            prompt = "Maintain and secure tie-downs according to guidelines.";
            defaultChecked = false;
          },
        ];
      },
      {
        title = "STRAP CONDITION";
        items = [
          {
            id = "fabric_integrity";
            name = "Check Fabric Integrity";
            prompt = "Strap Condition: Ensure integrity without excessive fraying or visible wear.";
            defaultChecked = false;
          },
          {
            id = "strain_points";
            name = "Check Strain Points";
            prompt = "Strap Condition: Inspect strain points for tears or deep abrasions.";
            defaultChecked = false;
          },
          {
            id = "edge_protection";
            name = "Check Edge Protection";
            prompt = "Strap Condition: Verify effectiveness of edge protection.";
            defaultChecked = false;
          },
          {
            id = "seam_integrity";
            name = "Check Seam Integrity";
            prompt = "Strap Condition: Look for weak spots, especially at seams.";
            defaultChecked = false;
          },
        ];
      },
      {
        title = "PALLET JACK";
        items = [
          {
            id = "pallet_jack";
            name = "Check Pallet Jack";
            prompt = "Check wheels, ensure proper mounting, and maintain tire pressure.";
            defaultChecked = false;
          },
        ];
      },
      {
        title = "SHELVES & BIN SYSTEM";
        items = [
          {
            id = "secure_fasteners";
            name = "Check Secure Fasteners";
            prompt = "Verify all shelves and bins have undamaged and secured fasteners.";
            defaultChecked = false;
          },
          {
            id = "bin_organization";
            name = "Check Bin Organization";
            prompt = "Ensure bins are organized with contents clearly labeled.";
            defaultChecked = false;
          },
          {
            id = "custom_racks";
            name = "Check Custom Racks";
            prompt = "Inspect custom racks for stability and proper attachment.";
            defaultChecked = false;
          },
        ];
      },
      {
        title = "CARGO WALLS & TIE-DOWN POINTS";
        items = [
          {
            id = "inspection_ports";
            name = "Check Inspection Ports";
            prompt = "Ensure all ports are in good condition (not twisted) and securely in place.";
            defaultChecked = false;
          },
          {
            id = "tie_down_points";
            name = "Check Tie Downs";
            prompt = "Check fixed cargo tiedowns and maintain for effective securing.";
            defaultChecked = false;
          },
        ];
      },
    ];
  };

  let savedChecklists = Map.empty<Principal, List.List<SavedChecklist>>();

  // ANONYMOUS ACCESS: Allow anyone (including guests) to submit checklists
  public shared ({ caller }) func saveChecklist(driverName : Text, signature : Text, checked : [(Text, Bool)]) : async () {
    // No authorization check - anonymous submissions allowed per implementation plan
    let checklist : SavedChecklist = {
      items = getChecklistSections()[0].items;
      signature;
      timestamp = getDayTimestamp(Time.now());
      driverName;
      driverId = caller;
      checked;
    };
    let checklists = switch (savedChecklists.get(caller)) {
      case (null) { List.empty<SavedChecklist>() };
      case (?existing) { existing };
    };
    // Remove existing checklist for the same day
    let filtered = checklists.filter(func(item) { item.timestamp != checklist.timestamp });
    filtered.add(checklist);
    savedChecklists.add(caller, filtered);
  };

  // ANONYMOUS ACCESS: Allow anyone (including guests) to submit checklists
  public shared ({ caller }) func saveChecklistFull(checklist : PreTripChecklist) : async () {
    // No authorization check - anonymous submissions allowed per implementation plan
    
    // SECURITY: Always use the authenticated caller as driverId
    // Never trust client-provided driverId to prevent impersonation
    let savedChecklist : SavedChecklist = {
      items = getChecklistSections()[0].items;
      driverId = caller; // Use authenticated caller, not client-provided value
      signature = checklist.signature;
      timestamp = getDayTimestamp(checklist.timestamp);
      driverName = checklist.driverName;
      checked = checklist.checked;
    };

    let checklists = switch (savedChecklists.get(caller)) {
      case (null) { List.empty<SavedChecklist>() };
      case (?existing) { existing };
    };
    // Remove existing checklist for the same day
    let filtered = checklists.filter(func(item) { item.timestamp != savedChecklist.timestamp });
    filtered.add(savedChecklist);
    savedChecklists.add(caller, filtered);
  };

  func getDayTimestamp(time : Time.Time) : Time.Time {
    // Get timestamp at 00:00 of the day
    time - (time % 86400000000000);
  };

  // USER ACCESS: Users can view their own completed checklists
  public query ({ caller }) func getCompletedChecklists() : async [SavedChecklist] {
    // Users can view their own checklists (including anonymous principals viewing their own)
    switch (savedChecklists.get(caller)) {
      case (null) { [] };
      case (?checklists) { checklists.toArray() };
    };
  };

  // USER ACCESS: Users can view their own checklist by date
  public query ({ caller }) func getChecklistByDate(date : Time.Time) : async ?SavedChecklist {
    // Users can view their own checklists (including anonymous principals viewing their own)
    switch (savedChecklists.get(caller)) {
      case (null) { null };
      case (?checklists) {
        let dailyTimestamp = getDayTimestamp(date);
        checklists.find(
          func(checklist) { checklist.timestamp == dailyTimestamp }
        );
      };
    };
  };

  // ADMIN ONLY: View all saved checklists from all users
  public query ({ caller }) func getAllSavedChecklists() : async [(Principal, [SavedChecklist])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all saved checklists");
    };

    let entries = Map.empty<Principal, [SavedChecklist]>();
    for ((principal, checklists) in savedChecklists.entries()) {
      entries.add(principal, checklists.toArray());
    };
    entries.toArray();
  };

  // ADMIN ONLY: Clear checkpoint history
  public shared ({ caller }) func clearCheckpointHistory() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can clear checkpoint history");
    };
    savedChecklists.clear();
  };

  // ================= User Profile Functions ================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ================= Truck Logging Functions ================

  public shared ({ caller }) func createLogEntry(title : ?Text, notes : Text, mileage : ?Int) : async Text {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can create logs");
    };
    let logEntry : LogEntry = {
      id = Time.now().toText();
      timestamp = Time.now();
      title;
      notes;
      mileage;
      owner = caller;
    };
    let userLogs = switch (logs.get(caller)) {
      case (null) { List.empty<LogEntry>() };
      case (?existing) { existing };
    };
    userLogs.add(logEntry);
    logs.add(caller, userLogs);
    logEntry.id;
  };

  public shared ({ caller }) func updateLogEntry(logId : Text, title : ?Text, notes : Text, mileage : ?Int) : async () {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can update logs");
    };
    switch (logs.get(caller)) {
      case (null) { Runtime.trap("No logs found") };
      case (?userLogs) {
        let logArray = userLogs.toArray();
        let index = logArray.findIndex(func(log) { log.id == logId });
        switch (index) {
          case (null) { Runtime.trap("Log not found") };
          case (?_) {
            let filtered = logArray.map(
              func(log) {
                if (log.id == logId) {
                  return {
                    id = log.id;
                    timestamp = log.timestamp;
                    title;
                    notes;
                    mileage;
                    owner = caller;
                  };
                };
                log;
              }
            );
            userLogs.clear();
            userLogs.addAll(filtered.values());
            logs.add(caller, userLogs);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteLogEntry(logId : Text) : async () {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can delete logs");
    };
    switch (logs.get(caller)) {
      case (null) { Runtime.trap("No logs found") };
      case (?userLogs) {
        let logArray = userLogs.toArray();
        let filtered = logArray.filter(func(log) { log.id != logId });
        if (filtered.size() == logArray.size()) {
          Runtime.trap("Log not found");
        };
        userLogs.clear();
        userLogs.addAll(filtered.values());
        logs.add(caller, userLogs);
      };
    };
  };

  public query ({ caller }) func getCallerLogEntries() : async [LogEntry] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view logs");
    };
    switch (logs.get(caller)) {
      case (null) { [] };
      case (?userLogs) { userLogs.toArray() };
    };
  };

  public query ({ caller }) func getUserLogEntry(user : Principal, logId : Text) : async LogEntry {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own logs");
    };
    switch (logs.get(user)) {
      case (null) { Runtime.trap("No logs found") };
      case (?userLogs) {
        let entryOpt = userLogs.find(func(log) { log.id == logId });
        switch (entryOpt) {
          case (null) { Runtime.trap("Log not found") };
          case (?log) { log };
        };
      };
    };
  };

  public query ({ caller }) func getAllLogEntries() : async [(Principal, [LogEntry])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all logs");
    };
    let entries = Map.empty<Principal, [LogEntry]>();
    for ((principal, userLogs) in logs.entries()) {
      entries.add(principal, userLogs.toArray());
    };
    entries.toArray();
  };

  // ================= Document Upload Functions ================

  public shared ({ caller }) func uploadDocument(blob : Storage.ExternalBlob, name : Text, contentType : Text, size : Nat) : async Text {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can upload documents");
    };
    let reference : UploadReference = {
      id = Time.now().toText();
      blob;
      name;
      contentType;
      size;
      timestamp = Time.now();
      owner = caller;
    };
    let userUploads = switch (uploads.get(caller)) {
      case (null) { List.empty<UploadReference>() };
      case (?existing) { existing };
    };
    userUploads.add(reference);
    uploads.add(caller, userUploads);
    reference.id;
  };

  public query ({ caller }) func getCallerUploads() : async [UploadReference] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view uploads");
    };
    switch (uploads.get(caller)) {
      case (null) { [] };
      case (?userUploads) { userUploads.toArray() };
    };
  };

  public query ({ caller }) func getUserUpload(user : Principal, uploadId : Text) : async UploadReference {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own uploads");
    };
    switch (uploads.get(user)) {
      case (null) { Runtime.trap("No uploads found") };
      case (?userUploads) {
        let referenceOpt = userUploads.find(func(upload) { upload.id == uploadId });
        switch (referenceOpt) {
          case (null) { Runtime.trap("Upload not found") };
          case (?reference) { reference };
        };
      };
    };
  };

  public query ({ caller }) func getAllUploads() : async [(Principal, [UploadReference])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all uploads");
    };
    let entries = Map.empty<Principal, [UploadReference]>();
    for ((principal, userUploads) in uploads.entries()) {
      entries.add(principal, userUploads.toArray());
    };
    entries.toArray();
  };

  // ================= Question Functions ================

  public shared ({ caller }) func submitQuestion(questionText : Text) : async Text {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can submit questions");
    };
    let question : Question = {
      id = Time.now().toText();
      questionText;
      timestamp = Time.now();
      status = #open;
      adminReply = null;
      owner = caller;
    };
    let userQuestions = switch (questions.get(caller)) {
      case (null) { List.empty<Question>() };
      case (?existing) { existing };
    };
    userQuestions.add(question);
    questions.add(caller, userQuestions);
    question.id;
  };

  public shared ({ caller }) func updateQuestionStatus(user : Principal, questionId : Text, status : QuestionStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update question status");
    };
    switch (questions.get(user)) {
      case (null) { Runtime.trap("No questions found") };
      case (?userQuestions) {
        let questionArray = userQuestions.toArray();
        let index = questionArray.findIndex(func(q) { q.id == questionId });
        switch (index) {
          case (null) { Runtime.trap("Question not found") };
          case (?_) {
            let filtered = questionArray.map(
              func(q) {
                if (q.id == questionId) {
                  return { q with status };
                };
                q;
              }
            );
            userQuestions.clear();
            userQuestions.addAll(filtered.values());
            questions.add(user, userQuestions);
          };
        };
      };
    };
  };

  public shared ({ caller }) func answerQuestion(user : Principal, questionId : Text, reply : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can answer questions");
    };
    switch (questions.get(user)) {
      case (null) { Runtime.trap("No questions found") };
      case (?userQuestions) {
        let questionArray = userQuestions.toArray();
        let index = questionArray.findIndex(func(q) { q.id == questionId });
        switch (index) {
          case (null) { Runtime.trap("Question not found") };
          case (?_) {
            let filtered = questionArray.map(
              func(q) {
                if (q.id == questionId) {
                  return {
                    q with
                    status = #answered;
                    adminReply = ?reply;
                  };
                };
                q;
              }
            );
            userQuestions.clear();
            userQuestions.addAll(filtered.values());
            questions.add(user, userQuestions);
          };
        };
      };
    };
  };

  public query ({ caller }) func getCallerQuestions() : async [Question] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view questions");
    };
    switch (questions.get(caller)) {
      case (null) { [] };
      case (?userQuestions) { userQuestions.toArray() };
    };
  };

  public query ({ caller }) func getUserQuestion(user : Principal, questionId : Text) : async Question {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own questions");
    };
    switch (questions.get(user)) {
      case (null) { Runtime.trap("No questions found") };
      case (?userQuestions) {
        let questionOpt = userQuestions.find(func(q) { q.id == questionId });
        switch (questionOpt) {
          case (null) { Runtime.trap("Question not found") };
          case (?question) { question };
        };
      };
    };
  };

  public query ({ caller }) func getAllQuestions() : async [(Principal, [Question])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all questions");
    };
    let entries = Map.empty<Principal, [Question]>();
    for ((principal, userQuestions) in questions.entries()) {
      entries.add(principal, userQuestions.toArray());
    };
    entries.toArray();
  };
};
